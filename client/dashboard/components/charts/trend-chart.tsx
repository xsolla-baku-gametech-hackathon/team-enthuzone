"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data, compact = false }: { data: TrendPoint[]; compact?: boolean }) {
  return <div className={compact ? "h-56" : "h-72"} role="img" aria-label="Feedback mentions and telemetry rate trend">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="date" stroke="var(--text-faint)" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="feedback" stroke="var(--text-faint)" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="telemetry" orientation="right" stroke="var(--text-faint)" tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: 4, color: "var(--text)" }} labelStyle={{ color: "var(--text-muted)" }} />
        <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 12 }} />
        <ReferenceLine x="Sep 07" stroke="var(--high)" strokeDasharray="4 4" label={{ value: "Build 1.8.0", fill: "var(--high)", fontSize: 11, position: "insideTopRight" }} />
        <Line yAxisId="feedback" type="monotone" dataKey="feedback" name="Feedback mentions" stroke="var(--info)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        <Line yAxisId="telemetry" type="monotone" dataKey="telemetry" name="Death / quit rate" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
