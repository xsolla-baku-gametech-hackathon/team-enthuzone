import { CheckCircle2 } from "lucide-react";

const rows = [
  {
    team: "Product",
    question: "What should enter the next release?",
    answer: "A ranked issue with reach, severity, confidence, and expected player impact.",
  },
  {
    team: "QA",
    question: "Can we reproduce the player path?",
    answer: "A shared evidence trail with reports, telemetry moments, and live bot verification.",
  },
  {
    team: "Game design",
    question: "Where is the experience breaking?",
    answer: "The exact level, checkpoint, or progression step where feedback and behavior converge.",
  },
];

export function TeamRundown() {
  return (
    <section id="for-teams" className="scroll-mt-20 border-y border-line bg-surface-sunken">
      <div className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">A shared rundown for the release room.</h2>
            <p className="mt-5 max-w-[60ch] text-base leading-7 text-muted">
              Each discipline sees the same issue, framed around the decision it needs to make.
            </p>
          </div>

          <div className="border-t border-line">
            {rows.map((row) => (
              <article key={row.team} className="grid gap-3 border-b border-line py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
                <div className="flex items-start gap-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-accent">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  {row.team}
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{row.question}</h3>
                  <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">{row.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
