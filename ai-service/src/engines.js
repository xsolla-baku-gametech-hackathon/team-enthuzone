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
      .trim();
  const t = clean(type);
  const roman = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,