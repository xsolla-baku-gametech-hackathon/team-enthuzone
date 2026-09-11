const { z } = require('zod');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const registrationPassword = z.string().min(12).max(128);

const registerSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
  email,
  password: registrationPassword,
}).strict();

const loginSchema = z.object({ email, password: z.string().min(1).max(128) }).strict();

module.exports = { registerSchema, loginSchema };
