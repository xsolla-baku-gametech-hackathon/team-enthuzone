const { z } = require("zod");
const candidate = z.object({
  type: z.enum(["Difficulty", "Bug", "UX", "Performance", "Economy", "Other"]),