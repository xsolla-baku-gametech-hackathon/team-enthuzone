import { apiFetch } from "./client";
import type { FeedbackItem, Issue, IssueResult } from "@/lib/types";

export async function getIssues(query = ""): Promise<IssueResult> {