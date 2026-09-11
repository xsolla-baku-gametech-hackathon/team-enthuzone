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
const {
  UserMongoModel,
} = require("../../src/modules/user/infrastructure/persistence/mongo/user.mongo.model");
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
          authenticity: "AI Approved",
          sentiment: "Negative",
        }),
      );
      ai.post("/internal/ai/correlate", (req, res) =>
        res.json({ supported: true, score: 1, reason: ["High abandonment"] }),
      );
      ai.post("/internal/ai/recommend", (req, res) =>
        res.json({ recommendations: ["Review Level 5 checkpoints."] }),
      );
      const listener = ai.listen(0);
      await new Promise((r) => listener.once("listening", r));
      t.after(() => new Promise((r) => listener.close(r)));
      process.env.AI_SERVICE_URL = `http://127.0.0.1:${listener.address().port}`;
      process.env.AI_INTERNAL_TOKEN = "test-internal-token-that-is-long-enough";
    }
    const app = createApp({
      organizationRepository: new MongoOrganizationRepository(),
      userRepository: new MongoUserRepository(),
      transactionManager: new MongoTransactionManager(),
      verifyGameUrl: async () => {},
      authConfig: {
        jwtSecret: "test-secret-that-is-at-least-32-characters",
        jwtExpiresIn: "15m",
        passwordHashRounds: 10,
      },
    });
    const client = request.agent(app);
    const other = request.agent(app);
    await client
      .post("/api/session/register")
      .send({
        organizationName: "Studio One",
        name: "Owner One",
        email: "one@example.test",
        password: "secure-password-123",
      })
      .expect(200);
    await other
      .post("/api/session/register")
      .send({
        organizationName: "Studio Two",
        name: "Owner Two",
        email: "two@example.test",
        password: "secure-password-456",
      })
      .expect(200);
    await other.get("/api/platform/admin/logs").expect(403);
    await UserMongoModel.updateOne(
      { email: "one@example.test" },
      { $set: { isSuperAdmin: true } },
    );
    await request(app)
      .post("/api/session/login")
      .send({ email: "one@example.test", password: "wrong-password" })
      .expect(401);
    const loginResponse = await client
      .post("/api/session/login")
      .send({
        email: "one@example.test",
        password: "secure-password-123",
        remember: true,
      })
      .expect(200);
    assert.equal(loginResponse.body.user.isSuperAdmin, true);
    const currentSession = await client.get("/api/auth/me").expect(200);
    assert.equal(currentSession.body.user.isSuperAdmin, true);
    const organizations = await client
      .get("/api/platform/admin/organizations")
      .expect(200);
    assert.equal(organizations.body.organizations.length, 2);
    await client.get("/api/platform/admin/logs").expect(200);
    const { body: w } = await client
      .post("/api/platform/workspaces")
      .send({ name: "Test Game", webglUrl: "https://example.com" })
      .expect(201);
    await other.get(`/api/platform/workspaces/${w.id}`).expect(404);
    await request(app).get("/api/platform/workspaces").expect(401);
    await client
      .post(`/api/platform/workspaces/${w.id}/connections`)
      .send({ name: "bad", type: "invalid" })
      .expect(400);
    const { body: c } = await client
      .post(`/api/platform/workspaces/${w.id}/connections`)
      .send({ name: "Game telemetry", type: "telemetry" })
      .expect(201);
    const stored = await models.Connection.findOne({ id: c.id }).select(
      "+keyHash",
    );
    assert.notEqual(stored.keyHash, c.key);
    const event = {
      eventId: "e1",
      playerId: "player1",
      sessionId: "session1",
      target: "level 5",
      eventType: "quit",
      duration: 120,
      build: "v1",
    };
    await request(app)
      .post("/api/platform/ingest/telemetry")
      .send({ events: [event] })
      .expect(401);
    await request(app)
      .post("/api/platform/ingest/telemetry")
      .set("x-api-key", c.key)
      .send({ events: [event] })
      .expect(202);
    const duplicate = await request(app)
      .post("/api/platform/ingest/telemetry")
      .set("x-api-key", c.key)
      .send({ events: [event] })
      .expect(202);
    assert.equal(duplicate.body.duplicates, 1);

    // 1. Test Toggle Connection Pause
    const { body: toggledPaused } = await client
      .patch(`/api/platform/workspaces/${w.id}/connections/${c.id}/toggle`)
      .expect(200);
    assert.equal(toggledPaused.status, "paused");

    // 2. Test Ingest when Paused (does not accept events, token remains valid)
    const pausedRes = await request(app)
      .post("/api/platform/ingest/telemetry")
      .set("x-api-key", c.key)
      .send({ events: [{ ...event, eventId: "e-paused-test" }] })
      .expect(200);
    assert.equal(pausedRes.body.paused, true);
    assert.equal(pausedRes.body.accepted, 0);

    // 3. Test Toggle Connection Back to Active (same token!)
    const { body: toggledActive } = await client
      .patch(`/api/platform/workspaces/${w.id}/connections/${c.id}/toggle`)
      .expect(200);
    assert.equal(toggledActive.status, "active");

    // 4. Test Ingest Resumed
    await request(app)
      .post("/api/platform/ingest/telemetry")
      .set("x-api-key", c.key)
      .send({ events: [{ ...event, eventId: "e-active-resumed" }] })
      .expect(202);

    const { body: source } = await client
      .post(`/api/platform/workspaces/${w.id}/connections`)
      .send({ name: "Discord players", type: "discord" })
      .expect(201);
    const feedback = {
      id: "discord-message-1",
      author: "player1",
      content: "Level 5 is far too difficult; I quit after ten attempts.",
    };
    await request(app)
      .post(`/api/platform/ingest/discord/${source.id}`)
      .set("x-webhook-token", source.key)
      .send(feedback)
      .expect(201);
    await request(app)
      .post(`/api/platform/ingest/discord/${source.id}`)
      .set("x-webhook-token", source.key)
      .send(feedback)
      .expect(200);
    let { body: d } = await client
      .get(`/api/platform/workspaces/${w.id}`)
      .expect(200);
    assert.equal(d.feedbackTotal, 1);
    assert.equal(d.issues.length, 1);
    assert.equal(d.issues[0].count, 1);
    assert.equal(d.connections[0].keyHash, undefined);

    // 5. Test AI Bot Scenario Verification
    const { body: botRes } = await client
      .post(
        `/api/platform/workspaces/${w.id}/issues/${d.issues[0].id}/verify-bot`,
      )
      .expect(200);
    assert.equal(botRes.success, true);
    assert(botRes.aiVerification.status === "APPROVED" || botRes.aiVerification.status === "REJECTED");

    // 6. Test Mock Telemetry Generation
    const { body: mockRes } = await client
      .post(`/api/platform/workspaces/${w.id}/telemetry/mock`)
      .expect(200);
    assert.equal(mockRes.success, true);
    assert(mockRes.injectedEvents >= 50);
    assert(mockRes.metrics.targets["level 5"].dropoff > 0);

    await client
      .post(
        `/api/platform/workspaces/${w.id}/issues/${d.issues[0].id}/recommend`,
      )
      .send({})
      .expect(200);
    await client
      .patch(`/api/platform/workspaces/${w.id}/issues/${d.issues[0].id}`)
      .send({ status: "RESOLVED" })
      .expect(200);
    const aiUrl = process.env.AI_SERVICE_URL;
    process.env.AI_SERVICE_URL = "http://127.0.0.1:1";
    const failed = await client
      .post(`/api/platform/workspaces/${w.id}/feedback`)
      .send({ author: "player2", text: "Level V is too difficult." })
      .expect(201);
    assert.equal(failed.body.analysisStatus, "failed");
    process.env.AI_SERVICE_URL = aiUrl;
    const retried = await client
      .post(`/api/platform/workspaces/${w.id}/feedback/${failed.body.id}/retry`)
      .send({})
      .expect(200);
    assert.equal(retried.body.analysisStatus, "complete");
    const clustered = await client
      .get(`/api/platform/workspaces/${w.id}`)
      .expect(200);
    assert.equal(clustered.body.issues.length, 1);
    assert.equal(clustered.body.issues[0].count, 2);
    const oldRefresh = client.jar.getCookie("refresh_token", {
      path: "/",
      domain: "127.0.0.1",
    });
    await client.post("/api/session/refresh").send({}).expect(200);
    if (oldRefresh)
      await request(app)
        .post("/api/session/refresh")
        .set("Cookie", `refresh_token=${oldRefresh.value}`)
        .send({})
        .expect(401);
    await client
      .delete(`/api/platform/workspaces/${w.id}/connections/${c.id}`)
      .expect(204);
    await request(app)
      .post("/api/platform/ingest/telemetry")
      .set("x-api-key", c.key)
      .send({ events: [event] })
      .expect(401);
    await client.delete(`/api/platform/workspaces/${w.id}`).expect(204);
    assert.equal(
      await models.Feedback.countDocuments({ workspaceId: w.id }),
      0,
    );
    const auditResponse = await client
      .get("/api/platform/admin/logs?pageSize=200")
      .expect(200);
    const auditActions = new Set(auditResponse.body.items.map((item) => item.action));
    for (const action of [
      "AUTH_REGISTER",
      "AUTH_LOGIN_SUCCESS",
      "AUTH_LOGIN_FAILED",
      "WORKSPACE_CREATED",
      "CONNECTION_CREATED",
      "CONNECTION_TOGGLED",
      "CONNECTION_DELETED",
      "ISSUE_STATUS_CHANGED",
      "WORKSPACE_DELETED",
      "ADMIN_LOGS_VIEWED",
    ]) {
      assert.equal(auditActions.has(action), true, `missing audit action ${action}`);
    }
    const serializedAuditLogs = JSON.stringify(auditResponse.body.items);
    assert.equal(serializedAuditLogs.includes(c.key), false);
    assert.equal(serializedAuditLogs.includes("keyHash"), false);
    await client.post("/api/session/logout").send({}).expect(204);
    await client.get("/api/platform/workspaces").expect(401);
  },
);
