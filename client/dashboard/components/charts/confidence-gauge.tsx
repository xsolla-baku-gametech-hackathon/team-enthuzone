export function ConfidenceGauge({ value }: { value: number }) {
  return <div aria-label={`${value}% correlation confidence`}>
    <div className="mb-2 flex items-end justify-between"><span className="text-sm font-semibold text-muted">Correlation confidence</span><span className="font-mono text-2xl font-bold text-accent-strong">{value}% <span className="text-xs font-semibold text-low">+6 pts</span></span></div>
    <div className="grid grid-cols-10 gap-1" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <span key={index} className={`h-2 rounded-sm ${index < Math.round(value / 10) ? "bg-accent" : "bg-line"}`} />)}</div>
    <p className="mt-2 text-xs text-muted">Strong alignment across feedback volume, boss failures, and session quits.</p>
  </div>;
}
