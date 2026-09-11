const { z } = require("zod");
const candidate = z.object({
  type: z.enum(["Difficulty", "Bug", "UX", "Performance", "Economy", "Other"]),
  target: z.string().min(1).max(150),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]),
  confidence: z.number().min(0).max(1),