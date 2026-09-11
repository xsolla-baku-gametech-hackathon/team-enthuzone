import { ArrowRight, Check, Gamepad2, MessageSquareText, RadioTower } from "lucide-react";

const steps = [
  {
    title: "Capture the player signal",
    body: "Bring issue reports and feedback topics into one workspace without losing the player’s words.",
    icon: MessageSquareText,
  },
  {
    title: "Match it to behavior",
    body: "Connect reports to drop-offs, retries, exits, and the exact gameplay moment where friction occurs.",
    icon: RadioTower,
  },
  {
    title: "Verify in context",
    body: "Use a live bot playtest to reproduce the suspected path and attach observable evidence to the issue.",
    icon: Gamepad2,
  },
  {
    title: "Choose the next fix",
    body: "Rank the issue by severity, confidence, and reach so product and QA can act from the same record.",
    icon: Check,
  },
];

export function EvidenceChain() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-surface-sunken">
      <div className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              One evidence chain, from report to release decision.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted">
              Player Issue Intelligence keeps qualitative context and behavioral proof in the same operational flow. No handoff spreadsheet is needed to explain why an issue matters.
            </p>
          </div>

          <ol className="border-t border-line">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[2.75rem_1fr_auto] sm:items-start">
                  <Icon className="mt-0.5 size-5 text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold tracking-[-0.01em] text-ink">{step.title}</h3>
                    <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted">{step.body}</p>
                  </div>
                  {index < steps.length - 1 ? (
                    <ArrowRight className="hidden size-4 text-faint sm:block" aria-hidden="true" />
                  ) : (
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-accent">Ready</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
