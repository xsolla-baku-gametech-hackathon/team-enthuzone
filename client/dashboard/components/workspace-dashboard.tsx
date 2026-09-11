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