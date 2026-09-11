import type { TopicCluster as Topic } from "@/lib/types";
import { formatCompact, signed } from "@/lib/utils/format";
import { FeedbackSourceIcon } from "./feedback-source-icon";

export function TopicCluster({ topic, max }: { topic: Topic; max: number }) {
  const tone = topic.sentimentScore < -60 ? "bg-critical" : topic.sentimentScore < 0 ? "bg-medium" : "bg-low";
  const textTone = topic.sentimentScore < -60 ? "text-critical" : topic.sentimentScore < 0 ? "text-medium" : "text-low";
  return <article className="border-b border-line px-5 py-4 last:border-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-ink">{topic.label}</h2><div className="mt-2 flex flex-wrap gap-3">{topic.sources.map((source) => <FeedbackSourceIcon key={source} source={source} />)}</div></div><div className="text-right"><p className="font-mono text-lg font-bold text-ink">{formatCompact(topic.mentions)} <span className="text-xs text-critical">{signed(topic.growth)}</span></p><p className={`mt-1 text-xs font-semibold ${textTone}`}>{topic.sentimentScore > 0 ? "Positive" : "Negative"} sentiment {topic.sentimentScore}</p></div></div><div className="mt-4 h-2 bg-surface-sunken"><div className={`h-2 ${tone}`} style={{ width: `${Math.max(8, (topic.mentions / max) * 100)}%` }} /></div></article>;
}
