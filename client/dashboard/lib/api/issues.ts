import { apiFetch } from "./client";
import type { FeedbackItem, Issue, IssueResult } from "@/lib/types";

export async function getIssues(query = ""): Promise<IssueResult> {
  return { issues: await apiFetch<Issue[]>(`/api/issues${query}`), sample: false };
}

export async function getIssue(id: string): Promise<{ issue: Issue; evidence: FeedbackItem[]; sample: boolean }> {