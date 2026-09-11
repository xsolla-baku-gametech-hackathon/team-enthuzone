export async function request<T>(
  path: string,
  body?: unknown,
  method = body === undefined ? "GET" : "POST",
  retried = false,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 401 && !retried && !path.startsWith("/session/")) {
    const refresh = await fetch("/api/session/refresh", { method: "POST" });
    if (refresh.ok) return request<T>(path, body, method, true);
    window.dispatchEvent(new Event("session-expired"));
    throw new Error("Please sign in");
  }
  if (response.status === 204) return undefined as T;
  const data = await response
    .json()
    .catch(() => ({ error: { message: "The server could not be reached" } }));
  if (!response.ok) throw new Error(data.error?.message || "Request failed");
  return data as T;
}
export type Workspace = {
  id: string;
  name: string;
  webglUrl: string;
  createdAt: string;
};
export type Feedback = {
  id: string;
  author: string;
  text: string;
  analysisStatus: string;
  candidate?: { authenticity: string };
  createdAt: string;
};
export type Metrics = {
  eventCount: number;
  uniquePlayers: number;
  targets: Record<
    string,
    {
      sessions: number;
      dropoff: number;
      avg_attempts: number;