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
    },
  };
  assert.equal(
    correlate({ type: "Difficulty", target: "Level V" }, metrics).score,
    1,
  );
  assert.equal(
    correlate({ type: "Difficulty", target: "Level 6" }, metrics).score,
    0,
  );
  assert.equal(correlate({ type: "UX", target: "Level 5" }, metrics).score, 0);
  assert.equal(
    correlate({ type: "Difficulty", target: "Level 5" }, { targets: {} })
      .supported,
    false,
  );
});