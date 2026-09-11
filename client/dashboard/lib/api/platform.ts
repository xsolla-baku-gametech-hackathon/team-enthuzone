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