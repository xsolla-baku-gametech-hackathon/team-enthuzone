"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ values, tone = "accent", label }: { values: number[]; tone?: "accent" | "critical" | "low"; label: string }) {
  const color = { accent: "var(--accent)", critical: "var(--critical)", low: "var(--low)" }[tone];