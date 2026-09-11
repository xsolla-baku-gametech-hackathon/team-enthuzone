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
  collection: 'telemetry_events',
  versionKey: false,
});

telemetryMongoSchema.index({ gameId: 1, buildVersion: 1, eventName: 1, timestamp: -1 });
telemetryMongoSchema.index({ gameId: 1, playerId: 1, timestamp: -1 });
telemetryMongoSchema.index({ gameId: 1, sessionId: 1, timestamp: -1 });
telemetryMongoSchema.index({ receivedAt: -1 });
// Wildcard index preserves queryability as each game introduces its own property keys.
telemetryMongoSchema.index({ 'properties.$**': 1 });

const TelemetryMongoModel = mongoose.models.TelemetryEvent
  || mongoose.model('TelemetryEvent', telemetryMongoSchema);

module.exports = { TelemetryMongoModel };
