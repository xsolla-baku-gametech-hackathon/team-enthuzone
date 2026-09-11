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