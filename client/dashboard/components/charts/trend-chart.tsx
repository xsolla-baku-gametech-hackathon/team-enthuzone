"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data, compact = false }: { data: TrendPoint[]; compact?: boolean }) {
  return <div className={compact ? "h-56" : "h-72"} role="img" aria-label="Feedback mentions and telemetry rate trend">