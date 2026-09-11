export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IssueStatus = "OPEN" | "INVESTIGATING" | "VALIDATING" | "RESOLVED";
export type FeedbackSource = "STEAM" | "DISCORD" | "REDDIT" | "SUPPORT";

export interface TrendPoint {
  date: string;
  feedback: number;
  telemetry: number;
  build?: string;
}

export interface Issue {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: Priority;
  status: IssueStatus;
  priorityScore: number;
  gameplayImpact: number;
  feedbackMentions: number;
  feedbackGrowth: number;
  correlationConfidence: number;
  deathRateChange: number;
  retryRateChange: number;
  quitRateChange: number;
  affectedBuild: string;
  affectedSegment: string;
  sparkline: number[];
}

export interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  excerpt: string;
  sentiment: "NEGATIVE" | "MIXED" | "POSITIVE";
  build: string;
  createdAt: string;
}

export interface TopicCluster {
  id: string;
  label: string;
  mentions: number;
  growth: number;