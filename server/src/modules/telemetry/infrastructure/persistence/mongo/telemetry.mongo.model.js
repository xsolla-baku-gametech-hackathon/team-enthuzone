const mongoose = require('mongoose');

const telemetryMongoSchema = new mongoose.Schema({
  _id: false,
  id: { type: String, required: true, unique: true },
  gameId: { type: String, required: true, index: true },
  playerId: { type: String, required: true },
  sessionId: { type: String, required: true },
  eventType: { type: String, required: true },
  eventName: { type: String, required: true },
  buildVersion: { type: String, required: true },
  timestamp: { type: String, required: true },
  receivedAt: { type: String, required: true },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {