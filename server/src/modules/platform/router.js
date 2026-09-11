const { Router } = require("express");
const { z } = require("zod");
const { randomBytes, createHash } = require("node:crypto");
const {
  Workspace,
  Connection,
  Feedback,
  Cluster,
  Event,
  Evidence,
  Profile,
} = require("./models");
const { priority, aggregate } = require("./engines");
const { aiCall } = require("./ai-client");
const { checkPublicUrl } = require("./public-url");
const { AppError } = require("../../shared/errors/app-error");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const name = z.string().trim().min(2).max(120);
const gameUrl = z
  .string()
  .url()
  .max(2048)
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  }, "Use a public HTTPS game URL");
function rateLimit(max = 120) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (clients.size > 10000)
      for (const [k, v] of clients) if (v.until < now) clients.delete(k);
    const key = req.ip;
    const entry = clients.get(key);
    const state =
      entry && entry.until > now ? entry : { count: 0, until: now + 60000 };
    state.count++;
    clients.set(key, state);
    if (state.count > max)
      return res
        .status(429)
        .set("Retry-After", "60")
        .json({ error: { message: "Rate limit exceeded" } });
    next();
  };
}
async function analyzeFeedback(feedback) {
  const claimed = await Feedback.findOneAndUpdate(
    { id: feedback.id, analysisStatus: { $in: ["pending", "failed"] } },
    { $set: { analysisStatus: "processing" } },
    { returnDocument: "after" },
  );
  if (!claimed) return;
  try {
    const existing = await Cluster.find({ workspaceId: feedback.workspaceId })
      .select("type target -_id")
      .limit(100)
      .lean();
    const result = await aiCall("analyze-feedback", {
      text: feedback.text,
      existing,
    });
    if (result.analysisStatus === "failed") {
      await Feedback.updateOne(
        { id: feedback.id },
        { $set: { candidate: result, analysisStatus: "failed" } },
      );
      return;
    }
    const { type, target } = result.normalized;
    let cluster;
    try {
      cluster = await Cluster.findOneAndUpdate(
        { workspaceId: feedback.workspaceId, type, target },
        {
          $setOnInsert: {
            summary: result.summary,
            severity: result.severity,
            authenticity: result.authenticity,
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    } catch (e) {
      if (e.code !== 11000) throw e;
      cluster = await Cluster.findOne({
        workspaceId: feedback.workspaceId,
        type,
        target,
      });
    }
    await Feedback.updateOne(
      { id: feedback.id },
      {
        $set: {
          candidate: result,
          clusterId: cluster.id,
          analysisStatus: "complete",
        },
      },
    );
  } catch (e) {
    await Feedback.updateOne(
      { id: feedback.id },
      { $set: { analysisStatus: "failed" } },
    );
    console.error(
      JSON.stringify({
        event: "feedback_analysis_failed",
        feedbackId: feedback.id,
        code: "AI_UNAVAILABLE",
      }),
    );
  }
  await refreshRecommendations(feedback.workspaceId);
}
async function rankIssues(feedback, clusters, metrics) {
  const allAuthors = new Set(feedback.map((f) => f.author));
  const issues = [];
  for (const c of clusters) {
    const members = feedback.filter((f) => f.clusterId === c.id);
    const affectedUsers = new Set(members.map((f) => f.author)).size;
    let correlation = {
      supported: false,
      score: 0,
      reason: ["AI service unavailable"],
      available: false,
    };
    try {
      correlation = {
        ...(await aiCall("correlate", {
          issue: { type: c.type, target: c.target },
          metrics,
        })),
        available: true,
      };
    } catch {
      console.error(
        JSON.stringify({ event: "correlation_unavailable", issueId: c.id }),
      );
    }
    const score = priority({
      correlation: correlation.score,
      affected: allAuthors.size ? affectedUsers / allAuthors.size : 0,
      severity: c.severity || 0,
      revenue: 0,
    });
    issues.push({
      ...c,
      count: members.length,
      affectedUsers,
      authenticity: members.some(
        (f) => f.candidate?.authenticity === "Needs Review",
      )
        ? "Needs Review"
        : c.authenticity,
      samples: members.slice(0, 5),
      correlation,
      priority: score,
      revenueImpactAvailable: false,
    });
  }
  return issues.sort((a, b) => b.priority.score - a.priority.score);
}
async function refreshRecommendations(workspaceId) {
  try {
    const filter = { workspaceId };
    const [feedback, clusters, events] = await Promise.all([
      Feedback.find(filter).lean(),
      Cluster.find(filter).lean(),
      Event.find(filter).lean(),
    ]);
    const metrics = aggregate(events);
    await Evidence.updateOne(filter, { $set: { metrics } }, { upsert: true });
    const ranked = await rankIssues(feedback, clusters, metrics);
    for (const issue of ranked
      .filter((i) => i.status !== "RESOLVED")
      .slice(0, 3)) {
      if (issue.recommendations?.length) continue;
      const claimed = await Cluster.findOneAndUpdate(
        {
          id: issue.id,
          recommendationStatus: { $nin: ["processing", "complete"] },
        },
        { $set: { recommendationStatus: "processing" } },
        { returnDocument: "after" },
      );
      if (!claimed) continue;
      try {
        const result = await aiCall("recommend", {
          issue: {
            type: issue.type,
            target: issue.target,
            summary: issue.summary,
            priority: issue.priority,
          },
          evidence: metrics,
        });
        await Cluster.updateOne(
          { id: issue.id },
          {
            $set: {
              recommendations: result.recommendations,
              recommendationStatus: "complete",
            },
          },
        );
      } catch {
        await Cluster.updateOne(
          { id: issue.id },
          { $set: { recommendationStatus: "failed" } },
        );
        console.error(