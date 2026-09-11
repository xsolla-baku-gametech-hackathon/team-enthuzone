import type { IssueStatus, Priority } from "@/lib/types";

const priorityTone: Record<Priority, string> = {
  CRITICAL: "bg-critical-surface text-critical",
  HIGH: "bg-high-surface text-high",
  MEDIUM: "bg-medium-surface text-medium",
  LOW: "bg-low-surface text-low",
};

const statusTone: Record<IssueStatus, string> = {
  OPEN: "bg-info-surface text-info",
  INVESTIGATING: "bg-high-surface text-high",
  VALIDATING: "bg-medium-surface text-medium",