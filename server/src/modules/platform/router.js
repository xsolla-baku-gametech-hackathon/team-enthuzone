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
          JSON.stringify({ event: "recommendation_failed", issueId: issue.id }),
        );
      }
    }
  } catch {
    console.error(
      JSON.stringify({ event: "insights_refresh_failed", workspaceId }),
    );
  }
}
function createPlatformRouter(authenticate, verifyGameUrl = checkPublicUrl) {
  const router = Router();
  router.use(rateLimit());
  async function owned(req) {
    const w = await Workspace.findOne({
      id: req.params.id,
      orgId: req.auth.organizationId,
    });
    if (!w) throw new AppError("Workspace not found", 404);
    return w;
  }
  router.post("/ingest/discord/:sourceId", async (req, res) => {
    const c = await Connection.findOne({
      id: req.params.sourceId,
      type: "discord",
    }).select("+keyHash");
    if (!c || hash(req.get("x-webhook-token") || "") !== c.keyHash)
      throw new AppError("Invalid webhook token", 401);
    const input = z
      .object({
        id: z.string().min(1).max(100),
        author: z.string().min(1).max(150),
        content: z.string().trim().min(1).max(6000),
      })
      .strict()
      .parse(req.body);
    let feedback;
    try {
      feedback = await Feedback.create({
        workspaceId: c.workspaceId,
        sourceId: c.id,
        externalId: input.id,
        author: input.author,
        text: input.content,
      });
    } catch (e) {
      if (e.code === 11000) return res.json({ duplicate: true });
      throw e;
    }
    await analyzeFeedback(feedback);
    res.status(201).json({ id: feedback.id });
  });
  router.post("/ingest/telemetry", async (req, res) => {
    const c = await Connection.findOne({
      keyHash: hash(req.get("x-api-key") || ""),
      type: "telemetry",
    });
    if (!c) throw new AppError("Invalid API key", 401, "UNAUTHORIZED");
    if (c.status === "paused") {
      return res.status(200).json({
        accepted: 0,
        paused: true,
        message: "Telemetry ingestion is currently paused for this connection",
      });
    }
    const input = z
      .object({
        events: z
          .array(
            z
              .object({
                eventId: z.string().min(1).max(100),
                playerId: z.string().min(1).max(100),
                sessionId: z.string().min(1).max(100),
                target: z.string().trim().min(1).max(150),
                eventType: z.enum([
                  "start",
                  "attempt",
                  "complete",
                  "quit",
                  "session_end",
                ]),
                duration: z.number().min(0).max(86400).default(0),
                build: z.string().max(100).default("unspecified"),
              })
              .strict(),
          )
          .min(1)
          .max(100),
      })
      .strict()
      .parse(req.body);
    const result = await Event.bulkWrite(
      input.events.map((e) => ({
        updateOne: {
          filter: { connectionId: c.id, eventId: e.eventId },
          update: {
            $setOnInsert: {
              ...e,
              workspaceId: c.workspaceId,
              connectionId: c.id,
            },
          },
          upsert: true,
        },
      })),
    );
    res
      .status(202)
      .json({
        accepted: result.upsertedCount,
        duplicates: input.events.length - result.upsertedCount,
      });
  });
  router.use(authenticate);
  router.get("/profile", async (req, res) =>
    res.json(
      (await Profile.findOne({ orgId: req.auth.organizationId }).lean()) || {},
    ),
  );
  router.put("/profile", async (req, res) => {
    const input = z
      .object({
        surname: z.string().max(120),
        location: z.string().max(200),
        businessDescription: z.string().max(2000),
        theme: z.enum(["dark", "light"]).optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      await Profile.findOneAndUpdate(
        { orgId: req.auth.organizationId },
        { $set: input },
        { upsert: true, returnDocument: "after" },
      ),
    );
  });
  router.get("/preview-url", async (req, res) => {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== "string") {
      return res.status(400).json({ error: { message: "URL is required" } });
    }
    try {
      const parsed = new URL(rawUrl);
      if (parsed.hostname.endsWith("itch.io")) {
        const response = await fetch(rawUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          signal: AbortSignal.timeout(6000),
        });
        const html = await response.text();
        const match = html.match(/https:\/\/[^"'\s]+\.itch\.zone\/[^"'\s]+/);
        if (match) {
          const cleanUrl = match[0].replace(/&quot;.*$/, "").replace(/["'\\]+$/, "");
          return res.json({ embedUrl: cleanUrl, originalUrl: rawUrl, embeddable: true });
        }
      }
      return res.json({
        embedUrl: rawUrl,
        originalUrl: rawUrl,
        embeddable: !parsed.hostname.endsWith("itch.io"),
      });
    } catch {
      return res.json({ embedUrl: rawUrl, originalUrl: rawUrl, embeddable: false });
    }
  });
  router.get("/workspaces", async (req, res) =>
    res.json(
      await Workspace.find({ orgId: req.auth.organizationId })
        .sort({ createdAt: -1 })
        .lean(),
    ),
  );
  router.post("/workspaces", async (req, res) => {
    const input = z
      .object({ name, webglUrl: gameUrl })
      .strict()
      .parse(req.body);
    await verifyGameUrl(input.webglUrl);
    res
      .status(201)
      .json(
        await Workspace.create({ ...input, orgId: req.auth.organizationId }),
      );
  });
  router.patch("/workspaces/:id", async (req, res) => {
    await owned(req);
    const input = z
      .object({ name: name.optional(), webglUrl: gameUrl.optional() })
      .strict()
      .parse(req.body);
    if (input.webglUrl) await verifyGameUrl(input.webglUrl);
    res.json(
      await Workspace.findOneAndUpdate(
        { id: req.params.id },
        { $set: input },
        { returnDocument: "after" },
      ),
    );
  });
  router.delete("/workspaces/:id", async (req, res) => {
    await owned(req);
    for (const model of [Connection, Feedback, Cluster, Event, Evidence])
      await model.deleteMany({ workspaceId: req.params.id });
    await Workspace.deleteOne({ id: req.params.id });
    res.status(204).end();
  });
  router.post("/workspaces/:id/connections", async (req, res) => {
    await owned(req);
    const input = z
      .object({
        name,
        type: z.enum(["discord", "telemetry", "bot"]),
        gameUrl: gameUrl.optional(),
      })
      .strict()
      .parse(req.body);
    if (input.type === "bot" && !input.gameUrl)
      throw new AppError("Game URL required", 400);
    if (input.gameUrl) await verifyGameUrl(input.gameUrl);
    const key =
      input.type === "bot" ? undefined : randomBytes(32).toString("base64url");
    const c = await Connection.create({
      ...input,
      workspaceId: req.params.id,
      ...(key ? { keyHash: hash(key) } : {}),
    });
    res
      .status(201)
      .json({ id: c.id, name: c.name, type: c.type, status: c.status || "active", gameUrl: c.gameUrl, key });
  });
  router.patch(
    "/workspaces/:id/connections/:connectionId/toggle",
    async (req, res) => {
      await owned(req);
      const c = await Connection.findOne({
        id: req.params.connectionId,
        workspaceId: req.params.id,
      });
      if (!c) throw new AppError("Connection not found", 404);
      c.status = c.status === "paused" ? "active" : "paused";
      await c.save();
      res.json({ id: c.id, name: c.name, type: c.type, status: c.status });
    },
  );
  router.delete(
    "/workspaces/:id/connections/:connectionId",
    async (req, res) => {
      await owned(req);
      await Connection.deleteOne({
        id: req.params.connectionId,
        workspaceId: req.params.id,
      });
      res.status(204).end();
    },
  );
  router.post("/workspaces/:id/telemetry/mock", async (req, res) => {
    await owned(req);
    const workspaceId = req.params.id;
    const mockEvents = [];

    const addSession = (target, playerId, sessionId, attempts, completed, quit, duration) => {
      mockEvents.push({
        workspaceId,
        connectionId: "mock-telemetry",
        eventId: `mock-evt-${playerId}-${sessionId}-start`,
        playerId,
        sessionId,
        target,
        eventType: "start",
        duration: 5,
        build: "1.0.0",
      });
      for (let i = 1; i <= attempts; i++) {
        mockEvents.push({
          workspaceId,
          connectionId: "mock-telemetry",
          eventId: `mock-evt-${playerId}-${sessionId}-att-${i}`,
          playerId,
          sessionId,
          target,
          eventType: "attempt",
          duration: Math.min(duration, i * 45),
          build: "1.0.0",
        });
      }
      if (completed) {
        mockEvents.push({
          workspaceId,
          connectionId: "mock-telemetry",
          eventId: `mock-evt-${playerId}-${sessionId}-comp`,
          playerId,
          sessionId,
          target,
          eventType: "complete",
          duration,
          build: "1.0.0",
        });
      }
      if (quit) {
        mockEvents.push({