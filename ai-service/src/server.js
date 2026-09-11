require("dotenv").config();
const express = require("express");
const { timingSafeEqual } = require("node:crypto");
const { z } = require("zod");
const { analyze, recommend } = require("./gemini");
const { normalize, correlate } = require("./engines");
function createApp() {