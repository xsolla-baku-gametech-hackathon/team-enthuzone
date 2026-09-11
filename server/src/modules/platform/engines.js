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