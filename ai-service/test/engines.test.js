const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalize, correlate } = require("../src/engines");
test("normalization unifies aliases, roman numerals and whitespace", () => {
  assert.deepEqual(