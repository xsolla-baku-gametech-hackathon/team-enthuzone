import { apiFetch } from "./client";
import type { TopicCluster } from "@/lib/types";

export async function getTopics(): Promise<{ topics: TopicCluster[]; sample: boolean }> {