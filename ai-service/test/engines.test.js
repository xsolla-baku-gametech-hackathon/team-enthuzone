const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalize, correlate } = require("../src/engines");
test("normalization unifies aliases, roman numerals and whitespace", () => {
  assert.deepEqual(
    normalize("Balance", " Level V "),
    normalize("Difficulty", "Level 5"),
  );
  assert.deepEqual(normalize("Lag", "Main menu"), {