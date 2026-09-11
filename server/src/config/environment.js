const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/player_issue_intelligence'),
  CORS_ORIGINS: z.string().default('*'),
  HTTP_BODY_LIMIT: z.string().default('1mb'),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  PASSWORD_HASH_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
}).superRefine((value, context) => {
  if (value.NODE_ENV === 'production' && !value.JWT_SECRET) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_SECRET'], message: 'JWT_SECRET is required in production' });
  }
});

const parsed = environmentSchema.parse(process.env);

const env = Object.freeze({
  nodeEnv: parsed.NODE_ENV,
  isTest: parsed.NODE_ENV === 'test',
  port: parsed.PORT,
  mongodbUri: parsed.MONGODB_URI,
  corsOrigins: parsed.CORS_ORIGINS === '*'
    ? '*'
    : parsed.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  httpBodyLimit: parsed.HTTP_BODY_LIMIT,
  jwtSecret: parsed.JWT_SECRET || 'development-only-secret-change-me-now',
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
  passwordHashRounds: parsed.PASSWORD_HASH_ROUNDS,