import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import type { Issue } from "@/lib/types";
import { signed } from "@/lib/utils/format";

export function IssueCard({ issue }: { issue: Issue }) {
  return <article className="min-w-0 overflow-hidden rounded-panel bg-surface p-5"><div className="flex flex-wrap items-center gap-2"><PriorityBadge priority={issue.priority} /><StatusBadge status={issue.status} /><span className="ml-auto font-mono text-xs text-muted">BUILD {issue.affectedBuild}</span></div><h2 className="mt-5 max-w-2xl break-words text-2xl font-bold tracking-tight text-ink">{issue.title}</h2><p className="mt-2 max-w-2xl text-base leading-6 text-muted">{issue.summary}</p><div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-control bg-line sm:grid-cols-4"><Metric label="Gameplay impact" value={`${issue.gameplayImpact}%`} trend={signed(12)} /><Metric label="Feedback" value={issue.feedbackMentions.toLocaleString()} trend={signed(issue.feedbackGrowth)} /><Metric label="Quit rate" value={signed(issue.quitRateChange)} trend={signed(issue.quitRateChange)} bad /><Metric label="Confidence" value={`${issue.correlationConfidence}%`} trend="+6 pts" /></div><div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">Affected segment: <span className="font-semibold text-ink">{issue.affectedSegment}</span></p><Link href={`/issues/${issue.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-accent-strong hover:text-accent">Inspect evidence <ArrowUpRight size={16} /></Link></div></article>;
}

function Metric({ label, value, trend, bad = false }: { label: string; value: string; trend: string; bad?: boolean }) {
  return <div className="bg-surface-sunken px-3 py-3"><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-1 font-mono text-lg font-bold text-ink">{value} <span className={`text-xs ${bad ? "text-critical" : "text-low"}`}>{trend}</span></p></div>;
}
