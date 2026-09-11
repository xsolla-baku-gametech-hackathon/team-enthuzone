const { z } = require("zod");
const candidate = z.object({
  type: z.enum(["Difficulty", "Bug", "UX", "Performance", "Economy", "Other"]),
  target: z.string().min(1).max(150),
  sentiment: z.enum(["Positive", "Neutral", "Negative"]),
  confidence: z.number().min(0).max(1),
  summary: z.string().max(500),
  authenticity: z.enum(["AI Approved", "Needs Review", "Likely Spam"]),
  severity: z.number().min(0).max(1),
});
const schema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["Difficulty", "Bug", "UX", "Performance", "Economy", "Other"],
    },
    target: { type: "string" },
    sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative"] },
    confidence: { type: "number" },
    summary: { type: "string" },
    authenticity: {
      type: "string",
      enum: ["AI Approved", "Needs Review", "Likely Spam"],
    },
    severity: { type: "number" },
  },
  required: [
    "type",
    "target",
    "sentiment",
    "confidence",
    "summary",