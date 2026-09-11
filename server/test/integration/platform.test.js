process.env.NODE_ENV = "test";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");
const { createApp } = require("../../src/app");
const {
  MongoOrganizationRepository,
} = require("../../src/modules/organization");
const { MongoUserRepository } = require("../../src/modules/user");
const { MongoTransactionManager } = require("../../src/modules/auth");
const models = require("../../src/modules/platform/models");
test(
  "workspace pipeline persists, isolates tenants, rotates keys and handles retries",
  { timeout: 240000 },
  async (t) => {