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
    path: "/",
  };
  async function issue(res, result, remember = true) {
    const refresh = randomBytes(48).toString("base64url");
    await Session.create({
      tokenHash: hash(refresh),
      userId: result.user.id,
      expiresAt: new Date(Date.now() + 30 * 86400000),
    });
    res.cookie("access_token", result.accessToken, {
      ...opts,
      maxAge: 15 * 60000,
    });
    res.cookie("refresh_token", refresh, {
      ...opts,
      ...(remember ? { maxAge: 30 * 86400000 } : {}),
    });
    res.json({ user: result.user, organization: result.organization });
  }
  router.post("/register", async (req, res) =>
    issue(res, await service.register(registerSchema.parse(req.body))),
  );
  router.post("/login", async (req, res) => {
    const { remember, ...input } = req.body;
    return issue(
      res,
      await service.login(loginSchema.parse(input)),
      remember !== false,
    );
  });
  router.post("/refresh", async (req, res) => {
    const token = cookies(req).refresh_token;
    if (!token) throw new AppError("Session expired. Please sign in.", 401);
    const session = await Session.findOneAndDelete({
      tokenHash: hash(token),
      expiresAt: { $gt: new Date() },
    });
    if (!session) throw new AppError("Session expired. Please sign in.", 401);
    const user = await service.userService.findById(session.userId);
    const organization =
      user && (await service.organizationService.findById(user.organizationId));
    if (!user || user.status !== "ACTIVE" || organization?.status !== "ACTIVE")
      throw new AppError("Session expired", 401);
    return issue(res, {