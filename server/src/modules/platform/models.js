const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");
function model(name, fields, indexes = []) {
  const schema = new mongoose.Schema(
    {
      id: { type: String, default: () => randomUUID(), unique: true },
      ...fields,
    },
    { timestamps: true, versionKey: false },
  );
  for (const [fields, options] of indexes) schema.index(fields, options);
  return mongoose.models[name] || mongoose.model(name, schema);
}
const Workspace = model("Workspace", {
  orgId: { type: String, index: true, required: true },
  name: String,
  webglUrl: String,
});
const Connection = model(
  "PlatformConnection",
  {
    workspaceId: { type: String, index: true },
    name: String,
    type: { type: String, enum: ["discord", "telemetry", "bot"] },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    keyHash: { type: String, select: false },
    gameUrl: String,
  },
  [[{ keyHash: 1 }, { unique: true, sparse: true }]],
);
const Feedback = model(
  "PlatformFeedback",
  {
    workspaceId: { type: String, index: true },
    sourceId: String,
    externalId: String,
    author: String,
    text: String,
    candidate: mongoose.Schema.Types.Mixed,
    clusterId: String,
    analysisStatus: { type: String, default: "pending" },
  },
  [
    [
      { sourceId: 1, externalId: 1 },
      {
        unique: true,
        partialFilterExpression: { externalId: { $type: "string" } },
      },
    ],
  ],
);
const Cluster = model(
  "IssueCluster",
  {
    workspaceId: { type: String, index: true },
    type: String,
    target: String,
    summary: String,
    severity: Number,
    authenticity: String,
    status: { type: String, default: "OPEN" },
    aiVerification: mongoose.Schema.Types.Mixed,
    recommendations: [String],
    recommendationStatus: String,
  },
  [[{ workspaceId: 1, type: 1, target: 1 }, { unique: true }]],
);
const Event = model(
  "PlatformEvent",
  {
    workspaceId: { type: String, index: true },
    connectionId: String,
    eventId: String,
    playerId: String,
    sessionId: String,
    target: String,
    eventType: String,
    duration: Number,
    build: String,
  },
  [[{ connectionId: 1, eventId: 1 }, { unique: true }]],
);
const Evidence = model("BehaviorEvidence", {
  workspaceId: { type: String, unique: true },
  metrics: mongoose.Schema.Types.Mixed,
});
const Session = model(
  "RefreshSession",
  {
    tokenHash: { type: String, unique: true },
    userId: String,
    expiresAt: Date,
  },
  [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
);
const Profile = model("OrganizationProfile", {