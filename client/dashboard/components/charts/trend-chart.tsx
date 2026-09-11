"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data, compact = false }: { data: TrendPoint[]; compact?: boolean }) {
  return <div className={compact ? "h-56" : "h-72"} role="img" aria-label="Feedback mentions and telemetry rate trend">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="date" stroke="var(--text-faint)" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />