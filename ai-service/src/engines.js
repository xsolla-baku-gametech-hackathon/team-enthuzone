function normalize(type, target) {
  const aliases = {
    hard: "difficulty",
    balance: "difficulty",
    gameplay_balance: "difficulty",
    crash: "bug",
    lag: "performance",