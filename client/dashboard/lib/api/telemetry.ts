import { apiFetch } from "./client";
import type { BuildMetric, TelemetryEvent, TrendPoint } from "@/lib/types";

export async function getOverviewTrend(): Promise<{ points: TrendPoint[]; sample: boolean }> {
  return { points: await apiFetch<TrendPoint[]>("/api/telemetry/trend"), sample: false };
}

export async function getTelemetry(): Promise<{ events: TelemetryEvent[]; sample: boolean }> {
  return { events: await apiFetch<TelemetryEvent[]>("/api/telemetry/metrics"), sample: false };
}

export async function compareBuilds(a: string, b: string): Promise<{ metrics: BuildMetric[]; sample: boolean }> {
  return { metrics: await apiFetch<BuildMetric[]>(`/api/telemetry/compare?buildA=${a}&buildB=${b}`), sample: false };
}
