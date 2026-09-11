const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),