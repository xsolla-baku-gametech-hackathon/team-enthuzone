const API_URL = process.env.DASHBOARD_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(path: string): Promise<T> {