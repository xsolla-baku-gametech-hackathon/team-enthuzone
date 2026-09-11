import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/landing-header";
import { ProgramMonitor } from "@/components/landing/program-monitor";
import { EvidenceChain } from "@/components/landing/evidence-chain";
import { ReleaseCompare } from "@/components/landing/release-compare";
import { TeamRundown } from "@/components/landing/team-rundown";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScoreRibbon } from "@/components/landing/score-ribbon";
import { AutonomousPlaytestSection } from "@/components/landing/autonomous-playtest-section";

export const metadata: Metadata = {
  title: "Player Issue Intelligence for Game Teams",
  description:
    "Connect player feedback with gameplay telemetry, verify issues in context, and decide what to fix next.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <LandingHeader />

      <main>
        <section className="mx-auto max-w-[90rem] px-4 pb-20 pt-11 sm:px-6 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="grid min-w-0 gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <h1 className="max-w-[12ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl">
                Know which player issue to fix next—and why.
              </h1>
              <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
                Connect player reports with in-game behavior. Turn feedback, telemetry, and live verification into one decision-ready issue record.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-3 text-center text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong sm:px-5"
                >
                  Create account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-surface px-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-surface-raised sm:px-5"
                >
                  See the evidence flow
                </Link>
              </div>

              <ScoreRibbon />
            </div>

            <ProgramMonitor />
          </div>
        </section>

        <EvidenceChain />
        <AutonomousPlaytestSection />
        <ReleaseCompare />
        <TeamRundown />

        <section className="border-b border-line bg-surface">
          <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-10">
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
                Bring the next release decision into focus.
              </h2>
              <p className="mt-4 max-w-[64ch] text-base leading-7 text-muted">
                Start with a workspace, connect player signals, and give product and QA one evidence-backed view of what deserves attention.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong"
            >
              Create your workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
