export const formatCompact = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
export const signed = (value: number) => `${value > 0 ? "+" : ""}${value}%`;
export const trendTone = (value: number, inverse = false) => {
  const bad = inverse ? value < 0 : value > 0;
  return bad ? "text-critical" : "text-low";
};
