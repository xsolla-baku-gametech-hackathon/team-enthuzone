"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  Layers3,
  RefreshCw,
  Copy,
  Trash2,
  Gamepad2,
  MessageSquare,
  Activity,
  X,
  Maximize2,
  Minimize2,
  Clock,
  Smartphone,
  Flame,
  RadioTower,
  Check,
  Bot,
  Sparkles,
} from "lucide-react";
import {
  request,
  type Workspace,
  type WorkspaceDetail,
  type Metrics,
} from "@/lib/api/platform";
import { BotLivePlaytestModal } from "./bot-live-playtest-modal";
import { useDialogFocus } from "./use-dialog-focus";
type Modal = "workspace" | "discord" | "telemetry" | "bot" | "source-picker" | null;
export function WorkspaceDashboard({
  section = "overview",
  issueId,
}: {
  section?: string;
  issueId?: string;
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [previewWorkspace, setPreviewWorkspace] = useState<Workspace | null>(null);
  const [activeBotTest, setActiveBotTest] = useState<{
    botName: string;
    gameUrl?: string;
  } | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 960, height: 540 });
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [secret, setSecret] = useState<{
    key: string;
    id: string;
    type: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState(section);
  const [filter, setFilter] = useState("");
  const [currentBuild, setCurrentBuild] = useState("");
  const [baselineBuild, setBaselineBuild] = useState("");
  const secretDialogRef = useDialogFocus<HTMLElement>(Boolean(secret), () =>
    setSecret(null),
  );
  const sourceDialogRef = useDialogFocus<HTMLElement>(
    modal === "source-picker",
    () => setModal(null),
  );
  const connectionDialogRef = useDialogFocus<HTMLElement>(
    Boolean(modal && modal !== "source-picker"),
    () => setModal(null),
  );
  const previewDialogRef = useDialogFocus<HTMLElement>(
    Boolean(previewWorkspace),
    () => setPreviewWorkspace(null),
  );
  const reload = useCallback(
    async (id = selected) => {
      if (id)
        setDetail(await request<WorkspaceDetail>(`/platform/workspaces/${id}`));
    },
    [selected],
  );
  useEffect(() => {
    let active = true;
    request<Workspace[]>("/platform/workspaces")
      .then(async (rows) => {
        if (!active) return;
        setWorkspaces(rows);
        const saved = localStorage.getItem("workspace");
        const id = rows.find((w) => w.id === saved)?.id || rows[0]?.id || "";
        setSelected(id);
        if (id) {
          const d = await request<WorkspaceDetail>(
            `/platform/workspaces/${id}`,
          );
          if (active) setDetail(d);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!previewWorkspace) {
      setResolvedUrl(null);
      setResolving(false);
      return;
    }
    let active = true;
    setResolving(true);
    fetch(`/api/resolve-preview?url=${encodeURIComponent(previewWorkspace.webglUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.embedUrl) {
          setResolvedUrl(data.embedUrl);
        } else {
          setResolvedUrl(previewWorkspace.webglUrl);
        }
      })
      .catch(() => {
        if (active) setResolvedUrl(previewWorkspace.webglUrl);
      })
      .finally(() => {
        if (active) setResolving(false);
      });
    return () => {
      active = false;
    };
  }, [previewWorkspace]);

  useEffect(() => {
    if (!previewWorkspace) return;
    const el = previewContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewWorkspace, isFullscreen]);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function choose(id: string) {
    setSelected(id);
    setDetail(null);
    localStorage.setItem("workspace", id);
    await action(() => reload(id));
  }
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await action(async () => {
      if (modal === "workspace") {
        const w = await request<Workspace>("/platform/workspaces", {
          name: data.get("name"),
          webglUrl: data.get("url"),
        });
        setWorkspaces([w, ...workspaces]);
        setSelected(w.id);
        localStorage.setItem("workspace", w.id);
        await reload(w.id);
      } else {
        const c = await request<{ key?: string; id: string; type: string }>(
          `/platform/workspaces/${selected}/connections`,
          {
            name: data.get("name"),
            type: modal,
            ...(modal === "bot" ? { gameUrl: data.get("url") } : {}),
          },
        );
        if (c.key) setSecret({ key: c.key, id: c.id, type: c.type });
        await reload();
      }
      setModal(null);
    });
  }
  const tabs = [
    "overview",
    "issues",
    "feedback",
    "telemetry",
    "bots",
    "compare",
  ];
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selected);
  const sectionMeta: Record<string, { title: string; description: string }> = {
    overview: {
      title: "Decision desk",
      description: "See the issue that needs attention and the evidence behind it.",
    },
    issues: {
      title: issueId ? "Issue evidence" : "Issue triage",
      description: issueId
        ? "Review priority, player impact, and supporting signals."
        : "Rank open player problems by impact and evidence strength.",
    },
    feedback: {
      title: "Player voices",
      description: "Inspect incoming reports and analysis status.",
    },
    telemetry: {
      title: "Behavior evidence",
      description: "Track drop-off, attempts, completion, and session duration.",
    },
    bots: {
      title: "Live playtest control",
      description: "Run autonomous playtests and capture verified telemetry.",
    },
    compare: {
      title: "Build comparison",
      description: "Validate release movement against a prior build.",
    },
  };
  const activeMeta = sectionMeta[tab] ?? sectionMeta.overview;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {activeMeta.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{activeMeta.description}</p>
        </div>
        <button className="primary" onClick={() => setModal("workspace")}>
          <Plus size={17} />
          Create workspace
        </button>
      </header>
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl bg-critical-surface p-4 text-critical"
        >
          <p>{error}</p>
          <button
            onClick={() =>
              action(async () => {
                const rows = await request<Workspace[]>("/platform/workspaces");
                setWorkspaces(rows);
                await reload();
              })
            }
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="text-accent">
          {notice}
        </p>
      )}
      {loading ? (
        <div className="glass rounded-xl p-12 text-muted">
          Loading your organization…
        </div>
      ) : !workspaces.length ? (
        <section className="glass grid min-h-96 place-content-center rounded-2xl p-8 text-center">
          <Layers3 size={54} className="mx-auto mb-6 text-accent" />
          <h2 className="text-2xl font-semibold">There is no workspace yet</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Give your game a home. Connect feedback and gameplay to discover
            what your players need.
          </p>
          <button
            className="primary mx-auto mt-7"
            onClick={() => setModal("workspace")}
          >
            <Plus size={17} />
            Create your first workspace
          </button>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-3 border-y border-line py-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="grid min-w-0 gap-1.5 sm:min-w-72">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Program workspace
              </span>
              <select
                className="field"
                value={selected}
                onChange={(event) => choose(event.target.value)}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedWorkspace?.webglUrl && (
              <button
                type="button"
                className="secondary shrink-0"
                onClick={() => setPreviewWorkspace(selectedWorkspace)}
              >
                <Gamepad2 size={16} />
                Preview current build
                <ArrowUpRight size={15} />
              </button>
            )}
          </section>
          {detail && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <nav
                  aria-label="Workspace sections"
                  className="flex max-w-full gap-1 overflow-x-auto"
                >
                  {tabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`rounded-lg px-3 py-2 text-sm capitalize ${tab === t ? "bg-accent text-canvas" : "text-muted hover:bg-surface"}`}
                    >
                      {t}
                    </button>
                  ))}
                </nav>
                <button
                  disabled={busy}
                  className="secondary"
                  onClick={() => action(() => reload())}
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>
              {(tab === "overview" || tab === "issues") && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">
                      {issueId ? "Issue evidence" : "Priority queue"}
                    </h2>
                    <input
                      className="field max-w-64"
                      aria-label="Filter issues"
                      placeholder="Search issues…"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  {!detail.issues.length && !issueId && (
                    <p className="rounded-xl bg-surface p-8 text-muted">
                      No analyzed issues yet. Add a feedback source or submit a
                      player review.
                    </p>
                  )}
                  <div className="grid gap-4 xl:grid-cols-2">
                    {detail.issues
                      .filter((i) => !issueId || i.id === issueId)
                      .filter((i) =>
                        `${i.type} ${i.target}`
                          .toLowerCase()
                          .includes(filter.toLowerCase()),
                      )
                      .map((i, index) => (
                        <article
                          key={i.id}
                          className={`glass rounded-xl p-5 ${issueId || index === 0 ? "xl:col-span-2" : ""}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-info-surface px-3 py-1 text-xs text-info">
                              {i.type}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${i.priority.score >= 70 ? "bg-critical-surface text-critical" : "bg-medium-surface text-medium"}`}
                            >
                              {i.priority.label} · {i.priority.score}
                            </span>
                            <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-muted">
                              {i.authenticity}
                            </span>
                            {/* AI Bot Verification Badge (Znak) */}
                            {i.aiVerification?.status === "APPROVED" ? (
                              <span
                                title={i.aiVerification.summary}
                                className="inline-flex items-center gap-1.5 rounded-full border border-low/40 bg-low-surface px-2.5 py-1 text-xs font-semibold text-low"
                              >
                                <Bot size={13} />
                                <span>AI Bot Confirmed</span>
                              </span>
                            ) : i.aiVerification?.status === "REJECTED" ? (
                              <span
                                title={i.aiVerification.summary}
                                className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised border border-line px-2.5 py-1 text-xs font-medium text-muted"
                              >
                                <Bot size={13} />
                                <span>AI Bot: Could Not Reproduce</span>
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-4 text-xl font-semibold capitalize">
                            {issueId ? (
                              i.target
                            ) : (
                              <Link
                                href={`/issues/${i.id}`}
                                className="transition-colors hover:text-accent"
                              >
                                {i.target}
                              </Link>
                            )}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {i.summary}
                          </p>
                          <dl className="mt-4 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">
                            <div className="bg-surface-sunken p-3">
                              <dt className="text-xs text-muted">Player impact</dt>
                              <dd className="mt-1 font-mono text-sm text-text">
                                {i.affectedUsers} reviewers · {i.count} reports
                              </dd>
                            </div>
                            <div className="bg-surface-sunken p-3">
                              <dt className="text-xs text-muted">Affected area</dt>
                              <dd className="mt-1 text-sm capitalize text-text">{i.target}</dd>
                            </div>
                            <div className="bg-surface-sunken p-3">
                              <dt className="text-xs text-muted">Build scope</dt>
                              <dd className="mt-1 text-sm text-text">Not reported</dd>
                            </div>
                          </dl>
                          <p className="mt-2 text-xs text-muted">
                            Telemetry support:{" "}
                            {Math.round(i.correlation.score * 100)}% ·{" "}
                            {i.correlation.reason.join(" / ") ||
                              "No supporting signals"}
                          </p>
                          <p className="mt-1 text-xs text-faint">
                            Priority uses reviewer share. Revenue impact is
                            unavailable and contributes 0.
                          </p>
                          {i.samples[0] && (
                            <blockquote className="mt-4 border-l-2 border-accent pl-3 text-sm leading-6 text-text">
                              <p>{i.samples[0].text}</p>
                              <footer className="mt-1 text-xs text-muted">
                                {i.samples[0].author} · {i.samples[0].candidate?.authenticity}
                              </footer>
                            </blockquote>
                          )}
                          {/* AI Bot Playthrough Report Box */}
                          {i.aiVerification && (
                            <div
                              className={`mt-4 rounded-xl border p-3.5 text-xs ${
                                i.aiVerification.status === "APPROVED"
                                  ? "border-low/30 bg-low-surface text-low"
                                  : "border-line bg-surface-sunken text-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold">
                                <div className="flex items-center gap-2">
                                  <Bot size={15} />
                                  <span>
                                    {i.aiVerification.status === "APPROVED"
                                      ? "AI Player Bot Verification: Issue Confirmed"
                                      : "AI Player Bot Verification: Could Not Reproduce"}
                                  </span>
                                </div>
                                {i.aiVerification.confidence && (
                                  <span className="text-[11px] opacity-80">
                                    Confidence: {Math.round(i.aiVerification.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                              <p className="mt-1.5 leading-relaxed text-[11px] opacity-90">
                                {i.aiVerification.summary}
                              </p>
                            </div>
                          )}
                          {i.samples.length > 1 && (
                            <details className="mt-4 border-t border-line pt-3">
                              <summary className="cursor-pointer text-sm text-accent">
                                View more player evidence ({i.count - 1})
                              </summary>
                            {i.samples.slice(1).map((f) => (
                              <blockquote
                                key={f.id}
                                className="mt-3 rounded-lg bg-surface-sunken p-3 text-sm"
                              >
                                <p>{f.text}</p>
                                <footer className="mt-2 text-xs text-muted">
                                  {f.author} · {f.candidate?.authenticity}
                                </footer>
                              </blockquote>
                            ))}
                            {i.count > 5 && (
                              <p className="mt-2 text-xs text-muted">
                                +{i.count - 5} more reviews in Feedback
                              </p>
                            )}
                            </details>
                          )}
                          {i.recommendations?.length > 0 && (
                            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-accent">
                              {i.recommendations.map((r) => (
                                <li key={r}>{r}</li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              disabled={busy}
                              className="secondary flex items-center gap-1.5"
                              onClick={() =>
                                action(async () => {
                                  const res = await request<{
                                    success: boolean;
                                    aiVerification: { status: string; summary: string };
                                  }>(
                                    `/platform/workspaces/${selected}/issues/${i.id}/verify-bot`,
                                    {},
                                    "POST",
                                  );
                                  setNotice(
                                    res.aiVerification.status === "APPROVED"
                                      ? "AI Bot test completed: Issue Confirmed! (Badge added)"
                                      : "AI Bot test completed: Could not reproduce issue.",
                                  );
                                  setTimeout(() => setNotice(""), 4500);
                                  await reload();
                                })
                              }
                            >
                              <Bot size={14} className="text-accent" />
                              {i.aiVerification ? "Re-test with AI Bot" : "Verify with AI Bot"}
                            </button>
                            <button
                              disabled={busy}
                              className="secondary"
                              onClick={() =>
                                action(async () => {
                                  await request(
                                    `/platform/workspaces/${selected}/issues/${i.id}/recommend`,
                                    {},
                                  );
                                  await reload();
                                })
                              }
                            >
                              Generate recommendations
                            </button>
                            <select
                              aria-label={`Status for ${i.target}`}
                              className="field w-auto"
                              value={i.status}
                              disabled={busy}
                              onChange={(e) =>
                                action(async () => {
                                  await request(
                                    `/platform/workspaces/${selected}/issues/${i.id}`,
                                    { status: e.target.value },
                                    "PATCH",
                                  );
                                  await reload();
                                })
                              }
                            >
                              {["OPEN", "INVESTIGATING", "RESOLVED"].map(
                                (s) => (
                                  <option key={s}>{s}</option>
                                ),
                              )}
                            </select>
                          </div>
                        </article>
                      ))}
                  </div>
                  {issueId && !detail.issues.some((issue) => issue.id === issueId) && (
                    <p className="rounded-xl border border-line bg-surface p-6 text-muted">
                      This issue is not available in the selected workspace.
                    </p>
                  )}
                  {!issueId && (
                    <section
                      aria-label="Workspace score ribbon"
                      className="grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3"
                    >
                      {[
                        ["Player feedback", detail.feedbackTotal, "reports in this workspace"],
                        ["Behavior events", detail.metrics.eventCount, "events in this workspace"],
                        [
                          "Open issues",
                          detail.issues.filter((i) => i.status !== "RESOLVED").length,
                          "unresolved in the current queue",
                        ],
                      ].map(([label, value, context]) => (
                        <div key={label} className="bg-surface px-5 py-4">
                          <p className="text-xs font-semibold text-muted">{label}</p>
                          <p className="mt-1 font-mono text-2xl text-text">{value}</p>
                          <p className="mt-1 text-xs text-faint">{context}</p>
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}
              {tab === "feedback" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">Player voices</h2>
                      <p className="mt-0.5 text-xs text-muted">
                        Stream reviews, feedback, and community sentiment across platforms
                      </p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => setModal("source-picker")}
                    >
                      <Plus size={16} />
                      Add source
                    </button>
                  </div>
                  <Connections type="discord" />
                  <form
                    className="glass grid gap-3 rounded-xl p-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const f = new FormData(form);
                      action(async () => {
                        await request(
                          `/platform/workspaces/${selected}/feedback`,
                          { author: f.get("author"), text: f.get("text") },
                        );
                        form.reset();
                        await reload();
                      });
                    }}
                  >
                    <h3 className="font-semibold">Analyze a player review</h3>
                    <input
                      className="field"
                      name="author"
                      placeholder="Player identifier"
                      aria-label="Player identifier"
                      required
                      maxLength={150}
                    />
                    <textarea
                      name="text"
                      className="field min-h-28"
                      placeholder="Paste the player's feedback…"
                      aria-label="Player review"
                      required
                      maxLength={6000}
                    />
                    <button
                      className="primary justify-self-start"
                      disabled={busy}
                    >
                      <MessageSquare size={16} />
                      {busy ? "Analyzing…" : "Analyze feedback"}
                    </button>
                  </form>
                  {detail.feedback.map((f) => (
                    <article key={f.id} className="rounded-xl bg-surface p-5">
                      <div className="flex justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {f.author}
                        </span>
                        <span className="text-xs text-muted">
                          {f.candidate?.authenticity || "Needs Review"}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                        {f.text}
                      </p>
                      {f.analysisStatus === "failed" && (
                        <button
                          disabled={busy}
                          className="secondary mt-3"
                          onClick={() =>
                            action(async () => {
                              await request(
                                `/platform/workspaces/${selected}/feedback/${f.id}/retry`,
                                {},
                              );
                              await reload();
                            })
                          }
                        >
                          Retry AI analysis
                        </button>
                      )}
                    </article>
                  ))}
                </>
              )}
              {tab === "telemetry" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">Behavior evidence</h2>
                      <p className="mt-0.5 text-xs text-muted">
                        Correlated gameplay dropoff, retry rates, and session completion metrics
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className="secondary flex items-center gap-1.5"
                        onClick={() =>
                          action(async () => {
                            await request(
                              `/platform/workspaces/${selected}/telemetry/mock`,
                              {},
                              "POST",
                            );
                            setNotice("Mock telemetry (Level 5 difficulty spike & onboarding) generated!");
                            setTimeout(() => setNotice(""), 4500);
                            await reload();
                          })
                        }
                      >
                        <Sparkles size={15} className="text-accent" />
                        Generate Mock Telemetry
                      </button>
                      <button
                        className="primary"
                        onClick={() => setModal("telemetry")}
                      >
                        <Plus size={16} />
                        Telemetry connection
                      </button>
                    </div>
                  </div>
                  <Connections type="telemetry" />
                  <MetricsView metrics={detail.metrics} />
                  <details className="rounded-xl bg-surface p-5">
                    <summary className="cursor-pointer text-accent">
                      Developer integration contract
                    </summary>
                    <p className="mt-3 text-sm text-muted">
                      POST /api/platform/ingest/telemetry with the x-api-key
                      header. Reuse eventId when retrying. duration is
                      cumulative session duration in seconds. Use a consistent
                      target such as level 5.
                    </p>
                    <pre className="mt-3 overflow-auto rounded-lg bg-surface-sunken p-4 text-xs">
                      {JSON.stringify(
                        {
                          events: [
                            {
                              eventId: "unique-event-id",
                              playerId: "player-id",
                              sessionId: "session-id",
                              target: "level 5",
                              eventType: "attempt",
                              duration: 60,
                              build: "your-build",
                            },
                          ],
                        },
                        null,
                        2,
                      )}
                    </pre>
                    <p className="mt-3 text-xs text-muted">
                      Events: start, attempt, complete, quit, session_end. Up to
                      100 events per request.
                    </p>
                  </details>
                </>
              )}
              {tab === "bots" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        AI Player Bot connections
                      </h2>
                      <p className="text-sm text-muted">
                        Test your games with autonomous AI Playtesting Bots. The AI plays live on screen with visible mouse cursor clicks and directional steering.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="secondary text-xs flex items-center gap-1.5"
                        onClick={() =>
                          setActiveBotTest({
                            botName: "Cyber Snake AI Autonomous Testbed",
                            gameUrl: "",
                          })
                        }
                      >
                        <Sparkles size={15} className="text-accent" />
                        Quick Snake AI Test
                      </button>
                      <button className="primary text-xs" onClick={() => setModal("bot")}>
                        <Plus size={16} />
                        Add AI Player Bot
                      </button>
                    </div>
                  </div>

                  {detail.connections.filter((c) => c.type === "bot").length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line p-8 sm:p-10 text-center bg-surface-sunken/40">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/30">
                        <Bot size={28} />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-text">
                        No AI Player Bot Connections Yet
                      </h3>
                      <p className="mt-1.5 text-xs text-muted max-w-md mx-auto leading-relaxed">
                        Launch an autonomous AI Playtest session immediately on the built-in Cyber Snake testbed, or add a WebGL game URL to test external builds.
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          className="primary text-xs py-2.5 px-4 flex items-center gap-2"
                          onClick={() =>
                            setActiveBotTest({
                              botName: "Cyber Snake AI Autonomous Testbed",
                              gameUrl: "",
                            })
                          }
                        >
                          <Sparkles size={16} />
                          Run live AI Snake test
                        </button>
                        <button
                          type="button"
                          className="secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
                          onClick={() => setModal("bot")}
                        >
                          <Plus size={15} />
                          Add AI Player Bot
                        </button>
                      </div>
                    </div>
                  ) : (
                    detail.connections
                      .filter((c) => c.type === "bot")
                      .map((c) => (
                        <article
                          key={c.id}
                          className="glass grid overflow-hidden rounded-xl md:grid-cols-[1fr_2fr]"
                        >
                          <div className="p-6">
                            <Gamepad2 className="text-accent" />
                            <h3 className="mt-4 text-xl font-semibold">
                              {c.name}
                            </h3>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className="primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                                onClick={() =>
                                  setActiveBotTest({
                                    botName: c.name,
                                    gameUrl: c.gameUrl,
                                  })
                                }
                              >
                                <Bot size={15} />
                                Run live AI playtest
                              </button>
                              <a
                                href={c.gameUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="secondary text-xs py-2 px-3 inline-block"
                              >
                                Open game ↗
                              </a>
                            </div>
                            <p className="mt-3 text-xs text-muted">
                              Run the live playtest to watch the autonomous agent steer and interact on screen.
                            </p>
                          </div>
                          <iframe
                            title={`${c.name} game preview`}
                            src={c.gameUrl}
                            loading="lazy"
                            sandbox="allow-scripts allow-pointer-lock"
                            referrerPolicy="no-referrer"
                            className="h-64 w-full border-0 bg-surface-sunken"
                          />
                        </article>
                      ))
                  )}
                </>
              )}
              {tab === "compare" && (
                <>
                  <h2 className="text-xl font-semibold">Build comparison</h2>
                  {detail.builds.length >= 2 && (
                    <div className="grid gap-3 border-y border-line py-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs font-semibold text-muted">
                        Current build
                        <select
                          className="field"
                          value={currentBuild}
                          onChange={(event) => {
                            setCurrentBuild(event.target.value);
                            if (event.target.value === baselineBuild) setBaselineBuild("");
                          }}
                        >
                          <option value="">Select current build</option>
                          {detail.builds.map((build) => (
                            <option key={build.build} value={build.build}>
                              {build.build}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1.5 text-xs font-semibold text-muted">
                        Baseline build
                        <select
                          className="field"
                          value={baselineBuild}
                          onChange={(event) => {
                            setBaselineBuild(event.target.value);
                            if (event.target.value === currentBuild) setCurrentBuild("");
                          }}
                        >
                          <option value="">Select baseline build</option>
                          {detail.builds.map((build) => (
                            <option key={build.build} value={build.build}>
                              {build.build}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                  {currentBuild && baselineBuild && (() => {
                    const current = detail.builds.find((build) => build.build === currentBuild);
                    const baseline = detail.builds.find((build) => build.build === baselineBuild);
                    if (!current || !baseline || current.build === baseline.build) return null;
                    const readings = [
                      {
                        label: "Events",
                        value: current.eventCount,
                        delta: percentChange(current.eventCount, baseline.eventCount),
                        tone: "text-accent",
                      },
                      {
                        label: "Players",
                        value: current.uniquePlayers,
                        delta: percentChange(current.uniquePlayers, baseline.uniquePlayers),
                        tone: "text-info",
                      },
                      {
                        label: "Average drop-off",
                        value: `${averageDropoff(current).toFixed(1)}%`,
                        delta: percentChange(
                          averageDropoff(current),
                          averageDropoff(baseline),
                        ),
                        tone:
                          averageDropoff(current) > averageDropoff(baseline)
                            ? "text-critical"
                            : "text-low",
                      },
                    ];
                    return (
                      <section aria-label="Build delta ribbon" className="overflow-hidden rounded-lg bg-line">
                        <header className="flex flex-wrap items-center justify-between gap-2 bg-surface-sunken px-4 py-3 text-xs text-muted">
                          <span className="font-mono text-text">{current.build}</span>
                          <span>compared with</span>
                          <span className="font-mono text-text">{baseline.build}</span>
                        </header>
                        <div className="grid gap-px sm:grid-cols-3">
                          {readings.map((reading) => (
                            <div key={reading.label} className="bg-surface px-4 py-4">
                              <p className="text-xs font-semibold text-muted">{reading.label}</p>
                              <p className={`mt-1 font-mono text-xl ${reading.tone}`}>
                                {reading.value}
                              </p>
                              <p className="mt-1 font-mono text-xs text-faint">
                                {reading.delta} vs baseline
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })()}
                  {detail.builds.length === 1 && (
                    <p className="border-y border-line py-5 text-muted">
                      Add telemetry for one more build to calculate release deltas.
                    </p>
                  )}
                  {!detail.builds.length && (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
                      <p className="text-muted">
                        Send telemetry with a build identifier to compare releases.
                      </p>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setTab("telemetry")}
                      >
                        <Activity size={16} />
                        Set up telemetry
                      </button>
                    </div>
                  )}
                  <div className="grid gap-4 xl:grid-cols-2">
                    {detail.builds.map((b) => (
                      <section key={b.build} className="glass rounded-xl p-5">
                        <h3 className="mb-4 font-mono font-semibold">
                          {b.build}
                        </h3>
                        <MetricsView metrics={b} />
                      </section>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      {secret && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 p-4 backdrop-blur-sm"
          onClick={() => setSecret(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSecret(null);
          }}
        >
          <section
            ref={secretDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="secret-modal-title"
            tabIndex={-1}
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-accent/40 bg-surface p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  {secret.type === "telemetry" ? (
                    <Activity size={22} />
                  ) : secret.type === "discord" ? (
                    <RadioTower size={22} />
                  ) : (
                    <Check size={22} />
                  )}
                </div>
                <div>
                  <h2 id="secret-modal-title" className="text-xl font-semibold">
                    {secret.type === "telemetry"
                      ? "Telemetry API Connection Created!"
                      : secret.type === "discord"
                      ? "Discord Source Created!"
                      : "API Key Generated!"}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {secret.type === "telemetry"
                      ? "Give these credentials and endpoint to your Game Developer to integrate gameplay tracking."
                      : "Save these credentials now. The secret key is only displayed once."}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close dialog"
                className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-raised hover:text-text"
                onClick={() => setSecret(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* TELEMETRY SPECIFIC UI */}
              {secret.type === "telemetry" ? (
                <>
                  {/* 1. Telemetry API Key */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                      Telemetry API key (use the x-api-key header)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-surface-sunken border border-line rounded-lg p-3 break-all text-accent select-all">
                        {secret.key}
                      </code>
                      <button
                        type="button"
                        className="secondary shrink-0 px-3 py-2.5 text-xs flex items-center gap-1.5"
                        onClick={() => {
                          navigator.clipboard.writeText(secret.key);
                          setNotice("API Key copied!");
                          setTimeout(() => setNotice(""), 3000);
                        }}
                      >
                        <Copy size={15} />
                        Copy Key
                      </button>
                    </div>
                  </div>

                  {/* 2. Endpoint URL */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                      Ingestion Endpoint URL (HTTP POST)
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-surface-sunken border border-line rounded-lg p-3 break-all text-text select-all">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/api/platform/ingest/telemetry`
                          : "http://127.0.0.1:4000/api/platform/ingest/telemetry"}
                      </code>
                      <button
                        type="button"
                        className="secondary shrink-0 px-3 py-2.5 text-xs flex items-center gap-1.5"
                        onClick={() => {
                          const endpoint =
                            typeof window !== "undefined"
                              ? `${window.location.origin}/api/platform/ingest/telemetry`
                              : "http://127.0.0.1:4000/api/platform/ingest/telemetry";
                          navigator.clipboard.writeText(endpoint);
                          setNotice("Endpoint URL copied!");
                          setTimeout(() => setNotice(""), 3000);
                        }}
                      >
                        <Copy size={15} />
                        Copy URL
                      </button>
                    </div>
                  </div>

                  {/* 3. Developer Documentation / Integration Snippet */}
                  <div className="rounded-xl bg-surface-sunken/80 border border-line/60 p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text">
                        Game Developer Integration Snippet:
                      </span>
                      <button
                        type="button"
                        className="text-xs text-accent hover:underline flex items-center gap-1"
                        onClick={() => {
                          const endpoint =
                            typeof window !== "undefined"
                              ? `${window.location.origin}/api/platform/ingest/telemetry`
                              : "http://127.0.0.1:4000/api/platform/ingest/telemetry";
                          const snippet = `// Endpoint: POST ${endpoint}
// Headers:
//   Content-Type: application/json
//   x-api-key: ${secret.key}

{
  "events": [
    {
      "eventId": "unique-event-id-001",
      "playerId": "player_123",
      "sessionId": "session_456",
      "target": "level 1",
      "eventType": "attempt",
      "duration": 45,
      "build": "1.0.0"
    }
  ]
}`;
                          navigator.clipboard.writeText(snippet);
                          setNotice("Developer code snippet copied!");
                          setTimeout(() => setNotice(""), 3000);
                        }}
                      >
                        <Copy size={12} />
                        Copy developer guide
                      </button>
                    </div>

                    <p className="text-muted leading-relaxed">
                      Send gameplay events from Unity, Unreal, Godot, or WebGL to the endpoint with the <code className="text-accent">x-api-key</code> header. The system automatically scopes metrics to this workspace.
                    </p>

                    <pre className="font-mono text-[11px] text-text/90 overflow-x-auto p-3 bg-surface rounded-lg border border-line/40 select-all leading-relaxed">
{`POST /api/platform/ingest/telemetry
Headers:
  Content-Type: application/json
  x-api-key: ${secret.key}

Body:
{
  "events": [
    {
      "eventId": "unique-event-id",
      "playerId": "player-id-123",
      "sessionId": "session-id-456",
      "target": "level 1",
      "eventType": "attempt",
      "duration": 45,
      "build": "1.0.0"
    }
  ]
}`}
                    </pre>

                    <p className="text-[11px] text-faint">
                      Allowed event types: <code className="text-accent font-mono">start</code>, <code className="text-accent font-mono">attempt</code>, <code className="text-accent font-mono">complete</code>, <code className="text-accent font-mono">quit</code>, <code className="text-accent font-mono">session_end</code>.
                    </p>
                  </div>
                </>
              ) : secret.type === "discord" ? (
                /* DISCORD SPECIFIC UI */
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                      Discord Webhook Token
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-surface-sunken border border-line rounded-lg p-3 break-all text-accent select-all">
                        {secret.key}
                      </code>
                      <button
                        type="button"
                        className="secondary shrink-0 px-3 py-2.5 text-xs flex items-center gap-1.5"
                        onClick={() => {
                          navigator.clipboard.writeText(secret.key);
                          setNotice("Webhook token copied!");
                          setTimeout(() => setNotice(""), 3000);
                        }}
                      >
                        <Copy size={15} />
                        Copy token
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                      Discord Source ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-xs bg-surface-sunken border border-line rounded-lg p-3 break-all text-text select-all">
                        {secret.id}
                      </code>
                      <button
                        type="button"
                        className="secondary shrink-0 px-3 py-2.5 text-xs flex items-center gap-1.5"
                        onClick={() => {
                          navigator.clipboard.writeText(secret.id);
                          setNotice("Source ID copied!");
                          setTimeout(() => setNotice(""), 3000);
                        }}
                      >
                        <Copy size={15} />
                        Copy ID
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-surface-sunken/70 border border-line/60 p-4 text-xs space-y-2">
                    <span className="font-semibold text-text">Paste these directly into your discord-bot/.env:</span>
                    <pre className="font-mono text-[11px] text-accent/90 overflow-x-auto p-2.5 bg-surface rounded-lg border border-line/40 select-all">
{`DISCORD_SOURCE_ID=${secret.id}
DISCORD_WEBHOOK_TOKEN=${secret.key}`}
                    </pre>
                  </div>
                </>
              ) : (
                /* GENERIC / BOT UI */
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                    API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-xs bg-surface-sunken border border-line rounded-lg p-3 break-all text-accent select-all">
                      {secret.key}
                    </code>
                    <button
                      type="button"
                      className="secondary shrink-0 px-3 py-2.5 text-xs flex items-center gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(secret.key);
                        setNotice("Key copied!");
                        setTimeout(() => setNotice(""), 3000);
                      }}
                    >
                      <Copy size={15} />
                      Copy key
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
              {notice ? (
                <span className="text-xs text-accent font-medium flex items-center gap-1">
                  <Check size={14} /> {notice}
                </span>
              ) : (
                <span className="text-xs text-faint">
                  The database stores only cryptographic hashes of keys.
                </span>
              )}
              <button
                type="button"
                className="primary text-xs py-2 px-4"
                onClick={() => setSecret(null)}
              >
                I have saved my credentials
              </button>
            </div>
          </section>
        </div>
      )}
      {modal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-canvas/90 p-4"
          onClick={() => setModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal(null);
          }}
        >
          {modal === "source-picker" ? (
            <section
              ref={sourceDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="source-picker-title"
              tabIndex={-1}
              className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div>
                  <h2 id="source-picker-title" className="text-xl font-semibold">
                    Add player feedback source
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Choose a player platform to stream reviews and sentiment directly into this workspace
                  </p>
                </div>
                <button
                  aria-label="Close dialog"
                  className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-raised hover:text-text"
                  onClick={() => setModal(null)}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {/* 1. Discord - Active */}
                <button
                  type="button"
                  onClick={() => setModal("discord")}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-surface-sunken p-4 text-left transition hover:border-accent hover:bg-surface-raised"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-surface text-info transition group-hover:bg-info group-hover:text-canvas">
                    <RadioTower size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-ink group-hover:text-accent transition">
                        Discord Community
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent border border-accent/30">
                        <Check size={12} />
                        Active
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Connect a Discord bot relay to listen to feedback and bug report channels in real time.
                    </p>
                  </div>
                </button>

                {/* 2. Steam Reviews - Coming soon */}
                <div className="glass flex items-start gap-4 rounded-xl p-4 text-left opacity-70 bg-surface-sunken/40 border-dashed border-line">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-muted">
                    <Gamepad2 size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-muted">Steam Store Reviews</h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium text-faint border border-line">
                        <Clock size={12} className="text-muted" />
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-faint leading-relaxed">
                      Automatic ingestion of player reviews, playtime tags, and community vote scores from Steam.
                    </p>
                  </div>
                </div>

                {/* 3. Reddit - Coming soon */}
                <div className="glass flex items-start gap-4 rounded-xl p-4 text-left opacity-70 bg-surface-sunken/40 border-dashed border-line">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-muted">
                    <Flame size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-muted">Reddit Subreddits</h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium text-faint border border-line">
                        <Clock size={12} className="text-muted" />
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-faint leading-relaxed">
                      Monitor mentions, player discussions, and feedback threads across game subreddits.
                    </p>
                  </div>
                </div>

                {/* 4. Mobile Stores - Coming soon */}
                <div className="glass flex items-start gap-4 rounded-xl p-4 text-left opacity-70 bg-surface-sunken/40 border-dashed border-line">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-muted">
                    <Smartphone size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-muted">App Store & Google Play</h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-2.5 py-0.5 text-[11px] font-medium text-faint border border-line">
                        <Clock size={12} className="text-muted" />
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-faint leading-relaxed">
                      Collect mobile store reviews, star ratings, and player crash complaints automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4 text-xs text-faint">
                <span>Discord integration is ready for streaming.</span>
                <button
                  type="button"
                  className="secondary text-xs py-1.5 px-3"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
              </div>
            </section>
          ) : (
            <section
              ref={connectionDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
              className="glass w-full max-w-lg rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between">
                <div>
                  {modal === "discord" && (
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline mb-1 flex items-center gap-1"
                      onClick={() => setModal("source-picker")}
                    >
                      ← Back to sources
                    </button>
                  )}
                  <h2 id="modal-title" className="text-xl font-semibold">
                    {modal === "workspace"
                      ? "Create workspace"
                      : `Add ${modal} connection`}
                  </h2>
                </div>
                <button
                  aria-label="Close dialog"
                  className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-raised hover:text-text"
                  onClick={() => setModal(null)}
                >
                  <X size={19} />
                </button>
              </div>
              <form className="mt-6 grid gap-4" onSubmit={create}>
                <label className="grid gap-2 text-sm">
                  Name
                  <input
                    autoFocus
                    className="field"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder={modal === "discord" ? "e.g. #feedback-channel" : undefined}
                  />
                </label>
                {(modal === "workspace" || modal === "bot") && (
                  <label className="grid gap-2 text-sm">
                    Public WebGL build URL
                    <input
                      className="field"
                      type="url"
                      name="url"
                      required
                      placeholder="https://…"
                    />
                  </label>
                )}
                {error && (
                  <p role="alert" className="text-sm text-critical">
                    {error}
                  </p>
                )}
                <button className="primary" disabled={busy}>
                  {busy ? "Creating…" : "Create connection"}
                </button>
              </form>
            </section>
          )}
        </div>
      )}
      {previewWorkspace && (() => {
        const BASE_W = 1280;
        const BASE_H = 720;
        const availW = containerSize.width || 960;
        const availH = containerSize.height || 540;
        const scale = Math.min(availW / BASE_W, availH / BASE_H) || 0.75;
        const scaledW = Math.round(BASE_W * scale);
        const scaledH = Math.round(BASE_H * scale);

        return (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 backdrop-blur-md ${
              isFullscreen ? "p-0" : "p-3 sm:p-5"
            }`}
            onClick={() => {
              setIsFullscreen(false);
              setPreviewWorkspace(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (isFullscreen) setIsFullscreen(false);
                else setPreviewWorkspace(null);
              }
            }}
          >
            <section
              ref={previewDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-modal-title"
              tabIndex={-1}
              className={`flex flex-col overflow-hidden border border-line bg-surface transition-all duration-150 ${
                isFullscreen
                  ? "h-screen w-screen rounded-none max-w-none max-h-none"
                  : "max-h-[95vh] w-full max-w-5xl rounded-2xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface/80">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Gamepad2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 id="preview-modal-title" className="truncate text-base font-semibold">
                      {previewWorkspace.name} — WebGL Preview
                    </h2>
                    <p className="truncate text-xs text-muted">
                      {previewWorkspace.webglUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <a
                    href={previewWorkspace.webglUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
                    title="Open original game in new tab"
                  >
                    Open in new tab
                    <ArrowUpRight size={14} />
                  </a>
                  <button
                    type="button"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-raised hover:text-text"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                  </button>
                  <button
                    type="button"
                    aria-label="Close preview"
                    className="grid size-11 place-items-center rounded-lg text-muted transition hover:bg-surface-raised hover:text-text"
                    onClick={() => {
                      setIsFullscreen(false);
                      setPreviewWorkspace(null);
                    }}
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div
                ref={previewContainerRef}
                className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-surface-sunken"
                style={{
                  height: isFullscreen ? "calc(100vh - 105px)" : "560px",
                  minHeight: isFullscreen ? "calc(100vh - 105px)" : "420px",
                  maxHeight: isFullscreen ? "calc(100vh - 105px)" : "68vh",
                }}
              >
                {resolving ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-sunken">
                    <RefreshCw size={28} className="animate-spin text-accent" />
                    <p className="text-sm font-medium text-muted">Connecting WebGL build…</p>
                  </div>
                ) : resolvedUrl ? (
                  <div
                    style={{
                      width: `${scaledW}px`,
                      height: `${scaledH}px`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      title={`${previewWorkspace.name} Game Preview`}
                      src={resolvedUrl}
                      scrolling="no"
                      allow="autoplay; fullscreen; focus-without-user-activation *; gamepad *"
                      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
                      style={{
                        width: "1280px",
                        height: "720px",
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        border: "none",
                        overflow: "hidden",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-muted">Unable to load live frame.</p>
                    <a
                      href={previewWorkspace.webglUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="primary"
                    >
                      Open in new tab ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface/60 px-5 py-3 text-xs text-muted">
                {resolvedUrl && resolvedUrl !== previewWorkspace.webglUrl ? (
                  <div className="flex items-center gap-2 text-accent font-medium">
                    <Check size={13} />
                    <span>Auto-scaled to fit ({scaledW}×{scaledH}) — zero scrollbars</span>
                  </div>
                ) : (
                  <span>
                    If your host restricts iframe embedding, click the link to play in a new tab.
                  </span>
                )}
                <a
                  href={previewWorkspace.webglUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:underline flex items-center gap-1 shrink-0 ml-auto"
                >
                  Open on {(() => {
                    try {
                      return new URL(previewWorkspace.webglUrl).hostname;
                    } catch {
                      return "site";
                    }
                  })()}
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </section>
          </div>
        );
      })()}
      {activeBotTest && (
        <BotLivePlaytestModal
          botName={activeBotTest.botName}
          gameUrl={activeBotTest.gameUrl}
          workspaceId={selected}
          onClose={() => setActiveBotTest(null)}
          onTelemetrySynced={() => reload()}
        />
      )}
    </div>
  );
  function Connections({ type }: { type: string }) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {detail?.connections
          .filter((c) => c.type === type)
          .map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface p-4 border border-line/60 hover:border-line transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm font-medium truncate">{c.name}</span>
                {c.type === "telemetry" && (
                  <button
                    type="button"
                    disabled={busy}
                    title={
                      c.status === "paused"
                        ? "Ingestion paused (Click to resume without changing token)"
                        : "Ingestion active (Click to pause without changing token)"
                    }
                    onClick={() =>
                      action(async () => {
                        await request(
                          `/platform/workspaces/${selected}/connections/${c.id}/toggle`,
                          {},
                          "PATCH",
                        );
                        setNotice(
                          c.status === "paused"
                            ? "Telemetry ingestion resumed (Token unchanged)."
                            : "Telemetry ingestion paused (Token preserved).",
                        );
                        setTimeout(() => setNotice(""), 3500);
                        await reload();
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition border cursor-pointer ${
                      c.status === "paused"
                        ? "border-medium/30 bg-medium-surface text-medium hover:border-medium/50"
                        : "border-low/30 bg-low-surface text-low hover:border-low/50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.status === "paused"
                          ? "bg-medium"
                          : "bg-low"
                      }`}
                    />
                    {c.status === "paused"
                      ? "Paused (Click to On)"
                      : "Active (Click to Off)"}
                  </button>
                )}
              </div>
              <button
                className="text-muted hover:text-critical p-1 rounded-lg hover:bg-surface-raised transition shrink-0"
                aria-label={`Revoke ${c.name}`}
                title={`Revoke ${c.name}`}
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    await request(
                      `/platform/workspaces/${selected}/connections/${c.id}`,
                      undefined,
                      "DELETE",
                    );
                    await reload();
                  })
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
      </div>
    );
  }
}
function MetricsView({ metrics }: { metrics: Metrics }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        <Activity size={15} className="mr-2 inline" />
        {metrics.eventCount} events · {metrics.uniquePlayers} players
      </p>
      {!Object.keys(metrics.targets).length && (
        <p className="rounded-xl bg-surface p-6 text-muted">
          No telemetry yet. Create a connection and send game events.
        </p>
      )}
      {Object.entries(metrics.targets).map(([target, m]) => (
        <section key={target} className="rounded-xl bg-surface p-5">
          <h3 className="font-semibold capitalize">
            {target}{" "}
            <span className="text-xs font-normal text-muted">
              / {m.sessions} sessions
            </span>
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Drop-off", `${m.dropoff.toFixed(1)}%`],
              ["Avg attempts", m.avg_attempts.toFixed(1)],
              ["Completion", `${m.completion_rate.toFixed(1)}%`],
              ["Avg session", `${m.avg_session.toFixed(1)} min`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-2 font-mono text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function averageDropoff(metrics: Metrics) {
  const targets = Object.values(metrics.targets);
  if (!targets.length) return 0;
  return targets.reduce((total, target) => total + target.dropoff, 0) / targets.length;
}

function percentChange(current: number, baseline: number) {
  if (baseline === 0) return current === 0 ? "0%" : "new";
  const change = ((current - baseline) / baseline) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}
