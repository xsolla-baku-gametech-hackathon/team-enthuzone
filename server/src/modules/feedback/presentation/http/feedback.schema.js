const { z } = require('zod');
const { FEEDBACK_SOURCES } = require('../../domain/feedback.constants');

const feedbackSchema = z.object({
  id: z.string().trim().min(1).optional(),
  gameId: z.string().trim().min(1).max(100),
  source: z.preprocess(
    (value) => typeof value === 'string' ? value.trim().toUpperCase() : value,
    z.enum(FEEDBACK_SOURCES),
  ),
  content: z.string().trim().min(3).max(10000),
  createdAt: z.string().datetime({ offset: true }).optional(),
  metadata: z.record(z.unknown()).default({}),
}).strict();
