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