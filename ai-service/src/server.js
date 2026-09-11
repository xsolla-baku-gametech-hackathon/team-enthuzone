require("dotenv").config();
const express = require("express");
const { timingSafeEqual } = require("node:crypto");
const { z } = require("zod");
const { analyze, recommend } = require("./gemini");
const { normalize, correlate } = require("./engines");
function createApp() {
  if ((process.env.AI_INTERNAL_TOKEN || "").length < 32)
    throw new Error("AI_INTERNAL_TOKEN must contain at least 32 characters");
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/internal", (req, res, next) => {
    const actual = Buffer.from(req.get("authorization") || "");
    const expected = Buffer.from(`Bearer ${process.env.AI_INTERNAL_TOKEN}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return res.status(401).json({ error: "Unauthorized" });
    next();
  });
  let active = 0;
  app.use("/internal", (_req, res, next) => {
    if (active >= 4)
      return res.status(429).json({ error: "AI busy; retry later" });
    active++;
    res.on("finish", () => active--);
    next();
  });
  app.post("/internal/ai/analyze-feedback", async (req, res) => {
    const { text, existing } = z
      .object({
        text: z.string().min(1).max(6000),
        existing: z
          .array(z.object({ type: z.string(), target: z.string() }))
          .max(100)
          .default([]),
      })
      .parse(req.body);
    try {
      const result = await analyze(text, existing);
      res.json({