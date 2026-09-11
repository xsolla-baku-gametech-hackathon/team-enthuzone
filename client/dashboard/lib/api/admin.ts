import { request } from "@/lib/api/platform";

export type AuditLogEntry = {
  id: string;
  orgId?: string;
  actorUserId?: string;
  actorEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
};

export type AuditLogPage = {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
};

export function fetchAuditLogs(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return request<AuditLogPage>(
    `/platform/admin/logs${qs ? `?${qs}` : ""}`,
  );
}

export function fetchOrganizations() {
  return request<{
    organizations: { id: string; name: string; slug: string }[];
  }>("/platform/admin/organizations");
}
