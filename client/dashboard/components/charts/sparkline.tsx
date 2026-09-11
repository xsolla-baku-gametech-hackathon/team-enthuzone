"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ values, tone = "accent", label }: { values: number[]; tone?: "accent" | "critical" | "low"; label: string }) {
  const color = { accent: "var(--accent)", critical: "var(--critical)", low: "var(--low)" }[tone];
  return <div className="h-8 w-20" role="img" aria-label={label}><ResponsiveContainer width="100%" height="100%"><LineChart data={values.map((value, index) => ({ index, value }))}><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>;
}
