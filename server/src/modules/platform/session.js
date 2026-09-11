const { Router } = require("express");
const { randomBytes } = require("node:crypto");
const { Session } = require("./models");
const { hash, rateLimit } = require("./router");
const {
  registerSchema,
  loginSchema,
} = require("../auth/presentation/http/auth.schema");
const { AppError } = require("../../shared/errors/app-error");
const { z } = require("zod");
function cookies(req) {