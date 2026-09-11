function priority({
  correlation = 0,
  affected = 0,
  revenue = 0,
  severity = 0,
}) {
  const values = [correlation, affected, revenue, severity];
  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 1))
    throw new RangeError("Priority inputs must be between 0 and 1");
  const score = Math.round(
    100 *
      (0.35 * correlation + 0.3 * affected + 0.2 * revenue + 0.15 * severity),
  );
  return {
    score,
    label:
      score >= 90
        ? "Critical"
        : score >= 70
          ? "High"
          : score >= 40
            ? "Medium"
            : "Low",
  };
}
function aggregate(events) {
  const targets = {};
  const users = new Set();
  for (const e of events) {
    users.add(e.playerId);
    const target = e.target.toLowerCase().trim();
    const t = (targets[target] ||= { sessions: new Map() });
    const key = `${e.playerId}:${e.sessionId}`;
    const s = t.sessions.get(key) || {
      attempts: 0,
      completed: false,
      quit: false,
      duration: 0,
    };
    s.attempts += e.eventType === "attempt" ? 1 : 0;
    s.completed ||= e.eventType === "complete";
    s.quit ||= e.eventType === "quit";
    s.duration = Math.max(s.duration, e.duration || 0);
    t.sessions.set(key, s);
  }
  for (const [key, t] of Object.entries(targets)) {
    const sessions = [...t.sessions.values()];
    const n = sessions.length;