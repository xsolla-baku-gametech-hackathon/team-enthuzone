import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface ScoreMetric { label: string; value: string; delta: string; direction: "up" | "down"; tone: "critical" | "low" | "accent"; period: string }

export function ScoreRibbon({ metrics }: { metrics: ScoreMetric[] }) {
  const tones = { critical: "text-critical", low: "text-low", accent: "text-accent-strong" };
  return <section className="mb-5 overflow-x-auto rounded-panel bg-surface" aria-label="Key performance indicators"><div className="grid min-w-[48rem] grid-cols-3 divide-x divide-line">{metrics.map((metric) => { const Icon = metric.direction === "up" ? ArrowUpRight : ArrowDownRight; return <div key={metric.label} className="px-5 py-4"><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-muted">{metric.label}</p><span className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${tones[metric.tone]}`}><Icon size={14} />{metric.delta}</span></div><div className="mt-2 flex items-end gap-3"><strong className="font-mono text-3xl font-bold tracking-tight text-ink">{metric.value}</strong><span className="pb-1 text-xs text-faint">{metric.period}</span></div></div>; })}</div></section>;
}
