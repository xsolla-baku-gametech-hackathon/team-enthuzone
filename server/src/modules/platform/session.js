const { Router } = require("express");
const { randomBytes } = require("node:crypto");
const { Session } = require("./models");
const { hash, rateLimit } = require("./router");
const {
  registerSchema,
  loginSchema,
} = require("../auth/presentation/http/auth.schema");
const { AppError } = require("../../shared/errors/app-error");
const { recordAuditLog, AUDIT_ACTIONS } = require("./audit-log");
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
  router.post("/register", async (req, res) => {
    const result = await service.register(registerSchema.parse(req.body));
    await recordAuditLog({
      orgId: result.organization.id,
      actorUserId: result.user.id,
      actorEmail: result.user.email,
      action: AUDIT_ACTIONS.AUTH_REGISTER,
      resourceType: "user",
      resourceId: result.user.id,
      ip: req.ip,
    });
    return issue(res, result);
  });
  router.post("/login", async (req, res) => {
    const { remember, ...input } = req.body || {};
    try {
      const result = await service.login(loginSchema.parse(input));
      await recordAuditLog({
        orgId: result.organization.id,
        actorUserId: result.user.id,
        actorEmail: result.user.email,
        action: AUDIT_ACTIONS.AUTH_LOGIN_SUCCESS,
        resourceType: "user",
        resourceId: result.user.id,
        ip: req.ip,
      });
      return issue(res, result, remember !== false);
    } catch (error) {
      await recordAuditLog({
        action: AUDIT_ACTIONS.AUTH_LOGIN_FAILED,
        metadata: {
          email: typeof input.email === "string" ? input.email : undefined,
        },
        ip: req.ip,
      });
      throw error;
    }
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organization: { id: organization.id, name: organization.name },
      accessToken: service.tokenService.sign(user),
    });
  });
  router.post("/logout", async (req, res) => {
    const token = cookies(req).refresh_token;
    if (token) await Session.deleteOne({ tokenHash: hash(token) });
    res.clearCookie("access_token", opts);
    res.clearCookie("refresh_token", opts);
    res.status(204).end();
  });
  router.post("/forgot-password", (_req, res) =>
    res
      .status(503)
      .json({
        error: {
          message:
            "Password recovery email is not configured. Contact your organization administrator.",
        },
      }),
  );
  router.use((err, req, res, next) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({
          error: {
            message: err.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
    next(err);
  });
  return router;
}
module.exports = { createSessionRouter, cookies };
