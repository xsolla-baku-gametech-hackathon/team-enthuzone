import styles from "@/app/landing/landing.module.css";

const signals = [
  { label: "Priority", value: "Critical" },
  { label: "Confidence", value: "92%" },
  { label: "Release", value: "1.8.1 review" },
];

export function ScoreRibbon() {
  return (
    <div className={`mt-6 overflow-hidden rounded-xl border border-line bg-surface-sunken ${styles.softPanel}`} aria-label="Sample issue score ribbon">
      <div className="grid grid-cols-3">
        {signals.map((signal) => (
          <div key={signal.label} className="min-w-0 border-r border-line px-2.5 py-3 last:border-r-0 sm:px-3">
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-faint">{signal.label}</div>
            <div className="mt-1 truncate font-mono text-xs font-semibold text-ink">{signal.value}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-2.5 py-1.5 font-mono text-[0.62rem] text-muted sm:px-3">Sample signal</div>
    </div>
  );
}
