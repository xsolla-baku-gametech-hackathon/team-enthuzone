import { ArrowRight, MessageSquareText, MousePointerClick } from "lucide-react";
import styles from "@/app/landing/landing.module.css";

function SignalPlot({ tone }: { tone: "accent" | "info" }) {
  const toneClass = tone === "accent" ? "text-accent" : "text-info";
  return (
    <svg
      viewBox="0 0 360 70"
      role="img"
      aria-label={tone === "accent" ? "Rising feedback volume signal" : "Gameplay drop-off signal"}
      className={`h-16 w-full ${toneClass}`}
    >
      <path d="M0 55H360" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M0 34H360" stroke="currentColor" strokeOpacity="0.12" />
      <path
        d="M0 52 C36 49 50 53 79 45 S126 23 158 36 S207 51 234 29 S278 15 304 20 S334 8 360 11"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 52 C36 49 50 53 79 45 S126 23 158 36 S207 51 234 29 S278 15 304 20 S334 8 360 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
        className={styles.signalTrace}
      />
      <circle cx="304" cy="20" r="5" fill="currentColor" className={styles.signalNode} />
    </svg>
  );
}

export function ProgramMonitor() {
  return (
    <section className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface ${styles.softPanel}`} aria-label="Sample correlated issue evidence">
      <div className="flex items-center justify-between border-b border-line bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Program monitor
          </span>
          <span className="rounded-control bg-critical-surface px-2 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-critical">
            Critical
          </span>
        </div>
        <span className="font-mono text-xs text-faint">Sample data</span>
      </div>

      <div className="order-2 grid min-w-0 lg:order-1 lg:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0 border-b border-line p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <MessageSquareText className="size-4 text-accent" aria-hidden="true" />
              Player feedback
            </div>
            <span className="font-mono text-xs text-muted">184 reports</span>
          </div>
          <SignalPlot tone="accent" />
          <blockquote className="mt-3 border-t border-line pt-3 text-sm leading-6 text-muted">
            “The checkpoint before Level 5 sends me back through the same choke point.”
          </blockquote>
        </div>

        <div className="hidden items-center justify-center bg-surface-sunken px-2 text-accent lg:flex">
          <ArrowRight className="size-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 p-4 lg:border-l lg:border-line">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <MousePointerClick className="size-4 text-info" aria-hidden="true" />
              Gameplay telemetry
            </div>
            <span className="font-mono text-xs text-muted">quit rate +76%</span>
          </div>
          <SignalPlot tone="info" />
          <div className="mt-3 grid grid-cols-2 border-t border-line pt-3">
            <div>
              <div className="font-mono text-lg font-semibold tabular-nums text-ink">03:42</div>
              <div className="text-xs text-muted">median retry time</div>
            </div>
            <div className="border-l border-line pl-4">
              <div className="font-mono text-lg font-semibold tabular-nums text-ink">38%</div>
              <div className="text-xs text-muted">session exits</div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 grid border-b border-line bg-surface-sunken sm:grid-cols-[1fr_auto] sm:items-center lg:order-2 lg:border-b-0 lg:border-t">
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Level 5 choke point</h2>
            <span className="font-mono text-xs font-semibold text-accent">92% correlation</span>
          </div>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Reports and exits converge at the same checkpoint. Review checkpoint spacing before build 1.8.1.
          </p>
          <div className="mt-3 flex gap-4 font-mono text-xs text-muted lg:hidden">
            <span>184 reports</span>
            <span>quit rate +76%</span>
          </div>
        </div>
        <div className="border-t border-line px-4 py-3 sm:border-l sm:border-t-0 sm:px-5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Decision ready</span>
        </div>
      </div>
    </section>
  );
}
