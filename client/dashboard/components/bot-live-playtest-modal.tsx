"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Sparkles,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sliders,
  Send,
  CheckCircle2,
  Crosshair,
  Gamepad2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { request } from "@/lib/api/platform";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

interface BotLivePlaytestModalProps {
  botName: string;
  gameUrl?: string;
  workspaceId: string;
  onClose: () => void;
  onTelemetrySynced?: () => void;
}

const GRID_SIZE = 20;

export function BotLivePlaytestModal({
  botName,
  gameUrl,
  workspaceId,
  onClose,
  onTelemetrySynced,
}: BotLivePlaytestModalProps) {
  // Game & Mode states
  const [mode, setMode] = useState<"snake" | "iframe">(gameUrl ? "snake" : "snake");
  const [level, setLevel] = useState<1 | 3 | 5>(1);
  const [speed, setSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 4 = insane, 0.5 = cinematic
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAiActive, setIsAiActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Game Engine state
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [obstacles, setObstacles] = useState<Point[]>([]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // AI Cursor Simulation states