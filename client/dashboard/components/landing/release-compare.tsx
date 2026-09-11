import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const measures = [
  { label: "Level completion", before: "61.2%", after: "76.0%", delta: "+14.8 pts", good: true },
  { label: "Checkpoint drop-off", before: "31.6%", after: "20.4%", delta: "−11.2 pts", good: true },
  { label: "Affected players", before: "2,840", after: "1,761", delta: "−38%", good: true },
];

export function ReleaseCompare() {
  return (
    <section id="release-proof" className="scroll-mt-20">
      <div className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Verify whether the fix changed player behavior.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted">
              Compare the current build with a named baseline. The same issue record shows what moved, what stayed flat, and whether the release reduced player friction.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4 font-mono text-xs text-muted">
            <span className="text-ink">Sample comparison</span>
            <span aria-hidden="true">/</span>
            <span>Current 1.8.1</span>
            <span aria-hidden="true">vs</span>
            <span>Baseline 1.8.0</span>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-t-xl border border-line">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <caption className="sr-only">Sample build comparison for Level 5 choke point</caption>
            <thead className="bg-surface-sunken font-mono text-xs uppercase tracking-[0.1em] text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold sm:px-5">Signal</th>
                <th className="px-4 py-3 font-semibold sm:px-5">1.8.0</th>
                <th className="px-4 py-3 font-semibold sm:px-5">1.8.1</th>
                <th className="px-4 py-3 font-semibold sm:px-5">Change</th>
              </tr>
            </thead>
            <tbody>
              {measures.map((measure) => (
                <tr key={measure.label} className="border-t border-line bg-surface">
                  <th className="px-4 py-5 text-sm font-semibold text-ink sm:px-5">{measure.label}</th>
                  <td className="px-4 py-5 font-mono text-sm tabular-nums text-muted sm:px-5">{measure.before}</td>
                  <td className="px-4 py-5 font-mono text-sm font-semibold tabular-nums text-ink sm:px-5">{measure.after}</td>
                  <td className="px-4 py-5 sm:px-5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums text-low">
                      {measure.delta.startsWith("+") ? (
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      ) : measure.delta.startsWith("−") ? (
                        <ArrowDownRight className="size-4" aria-hidden="true" />
                      ) : (
                        <Minus className="size-4" aria-hidden="true" />
                      )}
                      {measure.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid rounded-b-xl border-x border-b border-line bg-low-surface px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
          <div>
            <div className="font-semibold text-ink">Level 5 choke point improved</div>
            <p className="mt-1 text-sm leading-6 text-muted">The exit signal declined in the current build while completion recovered.</p>
          </div>
          <span className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-low sm:mt-0">Evidence confirmed</span>
        </div>
      </div>
    </section>
  );
}
