import type { TopicCluster as Topic } from "@/lib/types";
import { formatCompact, signed } from "@/lib/utils/format";
import { FeedbackSourceIcon } from "./feedback-source-icon";

export function TopicCluster({ topic, max }: { topic: Topic; max: number }) {
  const tone = topic.sentimentScore < -60 ? "bg-critical" : topic.sentimentScore < 0 ? "bg-medium" : "bg-low";
  const textTone = topic.sentimentScore < -60 ? "text-critical" : topic.sentimentScore < 0 ? "text-medium" : "text-low";