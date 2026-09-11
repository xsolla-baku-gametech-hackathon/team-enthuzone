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
  return Object.fromEntries(
    (req.get("cookie") || "").split(";").map((v) => v.trim().split("=")),
  );
}
function createSessionRouter(service) {
  const router = Router();
  router.use(rateLimit(20));
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",