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
        correlation: score / 100,
        affected: score / 100,
        revenue: score / 100,
        severity: score / 100,
      }),
      { score, label },
    );
  assert.throws(() => priority({ affected: 2 }), RangeError);
});
test("aggregation counts sessions once and distinguishes target evidence", () => {
  const event = (eventType, target = "level 5", sessionId = "s1") => ({
    playerId: "p1",
    sessionId,
    target,
    eventType,
    duration: 120,
  });
  const m = aggregate([
    event("start"),