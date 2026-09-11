import type { TopicCluster as Topic } from "@/lib/types";
import { formatCompact, signed } from "@/lib/utils/format";
import { FeedbackSourceIcon } from "./feedback-source-icon";

export function TopicCluster({ topic, max }: { topic: Topic; max: number }) {