const { test } = require("node:test");
const assert = require("node:assert/strict");
const { priority, aggregate } = require("../../src/modules/platform/engines");
test("priority applies exact weights and boundaries", () => {
  assert.deepEqual(
    priority({ correlation: 1, affected: 1, revenue: 1, severity: 1 }),
    { score: 100, label: "Critical" },
  );
  assert.equal(priority({ correlation: 1 }).score, 35);
  for (const [score, label] of [
    [39, "Low"],
    [40, "Medium"],
    [69, "Medium"],
    [70, "High"],
    [89, "High"],
    [90, "Critical"],
  ])
    assert.deepEqual(
      priority({