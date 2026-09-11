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