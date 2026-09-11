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
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
    x: 10,
  };
  return {
    type: aliases[t] || t,
    target: clean(target).replace(
      /\blevel (i{1,3}|iv|v|vi{1,3}|ix|x)\b/g,
      (_, n) => `level ${roman[n]}`,
    ),
  };
}
function correlate(issue, metrics) {