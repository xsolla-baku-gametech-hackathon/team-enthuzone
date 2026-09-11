process.env.NODE_ENV = "test";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");
const { createApp } = require("../../src/app");
const {
  MongoOrganizationRepository,
} = require("../../src/modules/organization");
const { MongoUserRepository } = require("../../src/modules/user");
const { MongoTransactionManager } = require("../../src/modules/auth");
const models = require("../../src/modules/platform/models");
test(
  "workspace pipeline persists, isolates tenants, rotates keys and handles retries",
  { timeout: 240000 },
  async (t) => {
    const db = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    t.after(async () => {
      await mongoose.disconnect();
      await db.stop();
    });
    await mongoose.connect(db.getUri());
    await Promise.all(Object.values(models).map((m) => m.init()));
    if (process.env.LIVE_AI !== "1") {
      const ai = express();
      ai.use(express.json());
      ai.post("/internal/ai/analyze-feedback", (req, res) =>
        res.json({
          type: "Difficulty",
          target: "Level 5",
          normalized: { type: "difficulty", target: "level 5" },
          summary: "Level 5 is too hard",
          severity: 0.8,
          confidence: 0.9,