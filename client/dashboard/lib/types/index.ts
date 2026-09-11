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