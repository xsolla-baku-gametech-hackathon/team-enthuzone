const { test } = require("node:test");
const assert = require("node:assert/strict");
const { checkPublicUrl } = require("../../src/modules/platform/public-url");
test("game URL validation rejects internal and unsafe addresses", async () => {
  for (const url of [
    "http://example.com",
    "https://127.0.0.1",
    "https://[::1]",