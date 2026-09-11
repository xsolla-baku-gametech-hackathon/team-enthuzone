import { apiFetch } from "./client";
import type { BuildMetric, TelemetryEvent, TrendPoint } from "@/lib/types";

export async function getOverviewTrend(): Promise<{ points: TrendPoint[]; sample: boolean }> {
  return { points: await apiFetch<TrendPoint[]>("/api/telemetry/trend"), sample: false };
}
