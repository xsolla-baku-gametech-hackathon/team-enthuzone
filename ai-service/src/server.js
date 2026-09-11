require("dotenv").config();
const express = require("express");
const { timingSafeEqual } = require("node:crypto");
const { z } = require("zod");
const { analyze, recommend } = require("./gemini");
const { normalize, correlate } = require("./engines");
function createApp() {
  if ((process.env.AI_INTERNAL_TOKEN || "").length < 32)
    throw new Error("AI_INTERNAL_TOKEN must contain at least 32 characters");