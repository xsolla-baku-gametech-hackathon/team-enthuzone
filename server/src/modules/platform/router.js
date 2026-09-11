const { Router } = require("express");
const { z } = require("zod");
const { randomBytes, createHash } = require("node:crypto");
const {
  Workspace,
  Connection,
  Feedback,
  Cluster,
  Event,
  Evidence,
  Profile,
} = require("./models");
const { priority, aggregate } = require("./engines");
const { aiCall } = require("./ai-client");
const { checkPublicUrl } = require("./public-url");
const { AppError } = require("../../shared/errors/app-error");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const name = z.string().trim().min(2).max(120);
const gameUrl = z
  .string()
  .url()
  .max(2048)
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;