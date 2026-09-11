"use client";

import {
  fetchAuditLogs,
  fetchOrganizations,
  type AuditLogEntry,
  type AuditLogPage,
} from "@/lib/api/admin";
import { fetchCurrentSession } from "@/lib/api/session";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Filters = {
  orgId: string;
  action: string;
  actorUserId: string;
  from: string;
  to: string;
};

const emptyFilters: Filters = {
  orgId: "",
  action: "",
  actorUserId: "",
  from: "",
  to: "",
};

const auditActions = [
  "AUTH_REGISTER",
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "WORKSPACE_CREATED",
  "WORKSPACE_UPDATED",
  "WORKSPACE_DELETED",
  "CONNECTION_CREATED",
  "CONNECTION_TOGGLED",
  "CONNECTION_DELETED",
  "ISSUE_STATUS_CHANGED",
  "ISSUE_RECOMMENDATION_REQUESTED",
  "ADMIN_LOGS_VIEWED",
];

function toQuery(filters: Filters, page: number) {
  const query: Record<string, string> = { page: String(page), pageSize: "50" };
  if (filters.orgId) query.orgId = filters.orgId;
  if (filters.action) query.action = filters.action;
  if (filters.actorUserId) query.actorUserId = filters.actorUserId.trim();
  if (filters.from) query.from = localDayBoundary(filters.from, false);
  if (filters.to) query.to = localDayBoundary(filters.to, true);
  return query;
}

function localDayBoundary(value: string, endOfDay: boolean) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  ).toISOString();
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function Resource({ entry }: { entry: AuditLogEntry }) {
  if (!entry.resourceType && !entry.resourceId) {
    return <span className="text-faint">—</span>;
  }
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-ink">{entry.resourceType || "Resource"}</span>
      <span className="font-mono text-xs text-muted">
        {entry.resourceId || "—"}
      </span>
    </span>
  );
}

export function AuditLogDashboard() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [organizations, setOrganizations] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [logs, setLogs] = useState<AuditLogPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [organizationError, setOrganizationError] = useState(false);
  const logRequestId = useRef(0);

  const loadLogs = useCallback(async (nextFilters: Filters, page = 1) => {
    const requestId = ++logRequestId.current;
    setLoading(true);
    setError("");
    try {
      const result = await fetchAuditLogs(toQuery(nextFilters, page));
      if (requestId === logRequestId.current) setLogs(result);
    } catch (loadError) {
      if (requestId === logRequestId.current) {
        setError((loadError as Error).message);
      }
    } finally {
      if (requestId === logRequestId.current) setLoading(false);
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    setOrganizationError(false);
    try {
      const result = await fetchOrganizations();
      setOrganizations(result.organizations);
    } catch {
      setOrganizationError(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchCurrentSession()
      .then((session) => {
        if (!active) return;
        const allowed = session.user.isSuperAdmin === true;
        setIsSuperAdmin(allowed);
        setCheckingSession(false);
        if (!allowed) return;
        void loadOrganizations();
        void loadLogs(emptyFilters, 1);
      })
      .catch(() => {
        if (!active) return;
        setIsSuperAdmin(false);
        setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [loadLogs, loadOrganizations]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(filters);
    void loadLogs(filters, 1);
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    void loadLogs(emptyFilters, 1);
  }

  if (checkingSession) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Checking access">
        <div className="h-16 max-w-xl rounded-panel bg-surface" />
        <div className="h-72 rounded-panel bg-surface" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <section
        lang="az"
        className="mx-auto mt-12 max-w-2xl rounded-panel bg-surface p-8 text-center ring-1 ring-line"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-control bg-critical-surface text-critical">
          <ShieldCheck size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-ink">
          Bu bölmə yalnız Super Admin üçündür
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
          Platform audit qeydlərini görmək üçün Super Admin səlahiyyəti tələb
          olunur.
        </p>
      </section>
    );
  }

  const totalPages = logs ? Math.max(Math.ceil(logs.total / logs.pageSize), 1) : 1;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            Admin logs
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Security-relevant platform activity across organizations, ordered by
            the latest event.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
          {logs ? `${logs.total} events` : "Loading events"}
        </div>
      </header>

      <form
        onSubmit={applyFilters}
        className="rounded-panel bg-surface p-4 ring-1 ring-line"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1.5 text-xs font-semibold text-muted">
            Organization
            <select
              className="field"
              value={filters.orgId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  orgId: event.target.value,
                }))
              }
            >
              <option value="">All organizations</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted">
            Action
            <select
              className="field"
              value={filters.action}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  action: event.target.value,
                }))
              }
            >
              <option value="">All actions</option>
              {auditActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted">
            Actor user ID
            <input
              className="field"
              value={filters.actorUserId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  actorUserId: event.target.value,
                }))
              }
              placeholder="usr_…"
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted">
            From
            <input
              className="field"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted">
            To
            <input
              className="field"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="submit" className="primary" disabled={loading}>
            <Filter size={16} aria-hidden="true" />
            {loading ? "Applying…" : "Apply filters"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={resetFilters}
            disabled={loading}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
        </div>
      </form>

      {organizationError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel bg-surface px-4 py-3 ring-1 ring-line">
          <p className="text-sm text-muted">
            Organization filter options could not be loaded.
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => void loadOrganizations()}
          >
            Retry organizations
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-panel bg-critical-surface px-4 py-3 text-sm text-ink"
        >
          <p>Audit logs could not be loaded. {error}</p>
          <button
            type="button"
            className="secondary"
            onClick={() => void loadLogs(appliedFilters, logs?.page || 1)}
          >
            Retry audit logs
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-panel bg-surface ring-1 ring-line">
        <div
          className="overflow-x-auto focus-visible:outline-offset-[-2px]"
          role="region"
          aria-label="Audit events table"
          tabIndex={0}
        >
          <table
            className="w-full min-w-[76rem] border-collapse text-left text-sm"
            aria-busy={loading}
          >
            <caption className="sr-only">
              Security-relevant platform audit events
            </caption>
            <thead className="bg-surface-sunken text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className={loading ? "opacity-60" : undefined}>
              {logs?.items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-line align-top transition-colors hover:bg-surface-raised"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                    {formatTimestamp(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-accent">
                    {entry.action}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-col gap-0.5">
                      <span className="text-ink">
                        {entry.actorEmail || "Unknown actor"}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {entry.actorUserId || "—"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {entry.orgId || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Resource entry={entry} />
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    {entry.metadata ? (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer select-none items-center text-xs font-semibold text-muted hover:text-ink">
                          View JSON
                        </summary>
                        <pre className="mt-2 max-h-56 overflow-auto rounded-control bg-surface-sunken p-3 font-mono text-xs leading-5 text-muted">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && logs?.items.length === 0 && (
          <div className="border-t border-line px-6 py-12 text-center">
            <p className="font-semibold text-ink">No audit events match</p>
            <p className="mt-1 text-sm text-muted">
              Adjust the filters or reset them to return to the full record.
            </p>
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-line bg-surface-sunken px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted" aria-live="polite">
            Page {logs?.page || 1} of {totalPages}
            {loading ? " · Loading results" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="secondary"
              disabled={loading || !logs || logs.page <= 1}
              onClick={() => logs && void loadLogs(appliedFilters, logs.page - 1)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              className="secondary"
              disabled={loading || !logs || logs.page >= totalPages}
              onClick={() => logs && void loadLogs(appliedFilters, logs.page + 1)}
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
