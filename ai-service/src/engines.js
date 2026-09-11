function normalize(type, target) {
  const aliases = {
    hard: "difficulty",
    balance: "difficulty",
    gameplay_balance: "difficulty",
    crash: "bug",
    lag: "performance",
    usability: "ux",
  };
  const clean = (s) =>
    s
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N} ]/gu, " ")
      .replace(/\s+/g, " ")