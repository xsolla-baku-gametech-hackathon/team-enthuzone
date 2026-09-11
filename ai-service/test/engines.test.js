const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalize, correlate } = require("../src/engines");
test("normalization unifies aliases, roman numerals and whitespace", () => {
  assert.deepEqual(
    normalize("Balance", " Level V "),
    normalize("Difficulty", "Level 5"),
  );
  assert.deepEqual(normalize("Lag", "Main menu"), {
    type: "performance",
    target: "main menu",
  });
});
test("correlation uses only matching target and category", () => {
  const metrics = {
    targets: {
      "level 5": {
        sessions: 10,
        dropoff: 41,
        avg_attempts: 6.8,
        completion_rate: 22,
      },