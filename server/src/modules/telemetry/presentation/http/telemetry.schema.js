const { z } = require('zod');
const { EVENT_TYPES } = require('../../domain/telemetry.constants');

const telemetrySchema = z.object({
  id: z.string().trim().min(1).optional(),
  gameId: z.string().trim().min(1).max(100),
  playerId: z.string().trim().min(1).max(200),
  sessionId: z.string().trim().min(1).max(200),
  eventType: z.preprocess(
    (value) => typeof value === 'string' ? value.trim().toUpperCase() : value,
    z.enum(EVENT_TYPES),
  ),
  eventName: z.string().trim().min(1).max(200),
  buildVersion: z.string().trim().min(1).max(50),
  timestamp: z.string().datetime({ offset: true }).optional(),
  properties: z.record(z.unknown()).default({}),
}).strict();

const telemetryBatchSchema = z.object({
  events: z.array(telemetrySchema).min(1).max(1000),
}).strict();

const telemetryQuerySchema = z.object({
  gameId: z.string().trim().min(1).optional(),
  playerId: z.string().trim().min(1).optional(),
  sessionId: z.string().trim().min(1).optional(),
  eventName: z.string().trim().min(1).optional(),
  buildVersion: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
}).strict();

module.exports = { telemetrySchema, telemetryBatchSchema, telemetryQuerySchema };
