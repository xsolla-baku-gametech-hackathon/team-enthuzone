export function FunnelChart({ stages }: { stages: { label: string; value: number; change: number }[] }) {
  const max = Math.max(...stages.map((stage) => stage.value));
  return <div className="space-y-3">{stages.map((stage) => <div key={stage.label}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-ink">{stage.label}</span><span className="font-mono text-muted">{stage.value.toLocaleString()} <span className={stage.change < 0 ? "text-critical" : "text-low"}>{stage.change > 0 ? "+" : ""}{stage.change}%</span></span></div><div className="h-2 bg-surface-sunken"><div className="h-2 bg-accent" style={{ width: `${(stage.value / max) * 100}%` }} /></div></div>)}</div>;
}
