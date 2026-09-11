"use client";
import { useCallback, useEffect, useState, useRef } from "react";
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
type Modal = "workspace" | "discord" | "telemetry" | "bot" | "source-picker" | null;
export function WorkspaceDashboard({
  section = "overview",
}: {
  section?: string;
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
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">ORGANIZATION / WORKSPACES</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Your next better build.
          </h1>
          <p className="mt-2 text-muted">
            Listen to players. Connect the evidence. Know what to fix.
          </p>
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((w) => {
              const hostname = (() => {
                try {
                  return new URL(w.webglUrl).hostname;
                } catch {
                  return w.webglUrl;
                }
              })();
              return (
                <div
                  key={w.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => choose(w.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") choose(w.id);
                  }}
                  className={`glass group relative flex flex-col justify-between rounded-xl p-5 text-left transition hover:-translate-y-0.5 cursor-pointer ${selected === w.id ? "ring-1 ring-accent" : ""}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Gamepad2 className="text-accent" />
                      <button
                        type="button"
                        title="Preview game build"
                        aria-label="Preview game build"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewWorkspace(w);
                        }}
                        className="flex items-center gap-1 rounded-lg p-1.5 text-muted transition hover:bg-surface-raised hover:text-accent"
                      >
                        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Preview
                        </span>
                        <ArrowUpRight size={17} />
                      </button>
                    </div>
                    <h2 className="mt-4 font-semibold text-lg">{w.name}</h2>
                    <p className="mt-1 truncate text-xs text-muted">
                      {hostname}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line/40 pt-3 text-xs">
                    <span className="text-faint">
                      Created {new Date(w.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewWorkspace(w);
                      }}
                      className="font-medium text-accent hover:underline flex items-center gap-1"
                    >
                      Play preview ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      ["Player feedback", detail.feedbackTotal],
                      ["Behavior events", detail.metrics.eventCount],
                      [
                        "Issues to investigate",
                        detail.issues.filter((i) => i.status !== "RESOLVED")
                          .length,
                      ],
                    ].map(([label, value]) => (
                      <section key={label} className="glass rounded-xl p-5">
                        <p className="text-xs text-muted">{label}</p>
                        <p className="mt-3 font-mono text-3xl">{value}</p>
                      </section>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Priority queue</h2>
                    <input
                      className="field max-w-64"
                      aria-label="Filter issues"
                      placeholder="Search issues…"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </div>
                  {!detail.issues.length && (
                    <p className="rounded-xl bg-surface p-8 text-muted">
                      No analyzed issues yet. Add a feedback source or submit a
                      player review.
                    </p>
                  )}
                  <div className="grid gap-4 xl:grid-cols-2">
                    {detail.issues
                      .filter((i) =>
                        `${i.type} ${i.target}`
                          .toLowerCase()
                          .includes(filter.toLowerCase()),
                      )
                      .map((i) => (
                        <article key={i.id} className="glass rounded-xl p-5">
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
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                            {i.target}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {i.summary}
                          </p>
                          <p className="mt-4 text-sm">
                            {i.affectedUsers} unique reviewers · {i.count}{" "}
                            mentions
                          </p>
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
                          {/* AI Bot Playthrough Report Box */}
                          {i.aiVerification && (
                            <div
                              className={`mt-4 rounded-xl border p-3.5 text-xs ${
                                i.aiVerification.status === "APPROVED"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
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
                          <details className="mt-4 border-t border-line pt-3">
                            <summary className="cursor-pointer text-sm text-accent">
                              Player evidence ({i.count})
                            </summary>
                            {i.samples.map((f) => (
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
                          🤖 Test at (Canlı AI Snake Oynasın)
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
                                className="primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow"
                                onClick={() =>
                                  setActiveBotTest({
                                    botName: c.name,
                                    gameUrl: c.gameUrl,
                                  })
                                }
                              >
                                <Bot size={15} />
                                🤖 Test at (Canlı AI Oynasın)
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
                              Click "Test at" to launch the autonomous AI playtester modal. The AI will physically steer and click to play live on screen.
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
                  {!detail.builds.length && (
                    <p className="text-muted">
                      Send telemetry with a build identifier to compare
                      releases.
                    </p>
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="secret-modal-title"
            className="glass w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl border border-accent/40 max-h-[92vh] overflow-y-auto"
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
                className="rounded-lg p-1.5 text-muted hover:bg-surface-raised hover:text-text transition"
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
                      Telemetry API Key (Pass in "x-api-key" Header)
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
                I've saved my credentials
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
              role="dialog"
              aria-modal="true"
              aria-labelledby="source-picker-title"
              className="glass w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl"
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
                  className="rounded-lg p-1.5 text-muted hover:bg-surface-raised hover:text-text transition"
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
                  className="glass group flex items-start gap-4 rounded-xl p-4 text-left transition hover:border-accent hover:bg-surface-raised hover:-translate-y-0.5 cursor-pointer border border-line"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5865F2]/15 text-[#5865F2] group-hover:bg-[#5865F2] group-hover:text-white transition">
                    <RadioTower size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-ink group-hover:text-accent transition">
                        Discord Community
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent border border-accent/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
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