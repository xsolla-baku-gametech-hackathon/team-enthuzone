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