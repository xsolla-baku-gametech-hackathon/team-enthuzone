import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface ScoreMetric { label: string; value: string; delta: string; direction: "up" | "down"; tone: "critical" | "low" | "accent"; period: string }

export function ScoreRibbon({ metrics }: { metrics: ScoreMetric[] }) {
  const tones = { critical: "text-critical", low: "text-low", accent: "text-accent-strong" };