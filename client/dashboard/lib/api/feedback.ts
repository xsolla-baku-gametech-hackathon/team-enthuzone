import { apiFetch } from "./client";
import type { TopicCluster } from "@/lib/types";

export async function getTopics(): Promise<{ topics: TopicCluster[]; sample: boolean }> {
  return { topics: await apiFetch<TopicCluster[]>("/api/feedback/topics"), sample: false };
}
