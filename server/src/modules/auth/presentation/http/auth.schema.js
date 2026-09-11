const { z } = require('zod');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const registrationPassword = z.string().min(12).max(128);
