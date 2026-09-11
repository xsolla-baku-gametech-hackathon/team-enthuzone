import { FeedbackSourceIcon } from "@/components/feedback/feedback-source-icon";
import { TrendChart } from "@/components/charts/trend-chart";
import type { FeedbackItem, TrendPoint } from "@/lib/types";

export function EvidencePanel({ feedback, trend }: { feedback: FeedbackItem[]; trend: TrendPoint[] }) {