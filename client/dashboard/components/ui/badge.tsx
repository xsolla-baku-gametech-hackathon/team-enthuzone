import type { IssueStatus, Priority } from "@/lib/types";

const priorityTone: Record<Priority, string> = {
  CRITICAL: "bg-critical-surface text-critical",
  HIGH: "bg-high-surface text-high",
  MEDIUM: "bg-medium-surface text-medium",