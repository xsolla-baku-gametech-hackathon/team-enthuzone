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
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 250, y: 250 });
  const [cursorClicking, setCursorClicking] = useState<boolean>(false);
  const [cursorAction, setCursorAction] = useState<string>("Scanning...");
  const [lastActionDir, setLastActionDir] = useState<Direction | null>(null);

  // Telemetry & Neural Logs
  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: "ai" | "telemetry" | "game" | "alert"; text: string }>>([
    {
      id: "1",
      time: "00:00",
      type: "ai",
      text: `Autonomous AI Playtest Bot initialized for: ${botName}`,
    },
    {
      id: "2",
      time: "00:01",
      type: "telemetry",
      text: `Telemetry channel engaged. Tracking player metrics & drop-offs.`,
    },
  ]);
  const [isSendingTelemetry, setIsSendingTelemetry] = useState(false);
  const [telemetryNotice, setTelemetryNotice] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const logBoxRef = useRef<HTMLDivElement | null>(null);
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const obstaclesRef = useRef(obstacles);
  const isPlayingRef = useRef(isPlaying);
  const isAiActiveRef = useRef(isAiActive);
  const speedRef = useRef(speed);
  const isGameOverRef = useRef(isGameOver);

  snakeRef.current = snake;
  directionRef.current = direction;
  foodRef.current = food;
  obstaclesRef.current = obstacles;
  isPlayingRef.current = isPlaying;
  isAiActiveRef.current = isAiActive;
  speedRef.current = speed;
  isGameOverRef.current = isGameOver;

  const addLog = useCallback((type: "ai" | "telemetry" | "game" | "alert", text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(Math.floor(now.getMilliseconds() / 100))}`;
    setLogs((prev) => [
      ...prev.slice(-30),
      { id: `${Date.now()}-${Math.random()}`, time: timeStr, type, text },
    ]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Generate obstacles based on Level
  const initLevelObstacles = useCallback((lvl: 1 | 3 | 5) => {
    if (lvl === 1) {
      setObstacles([]);
      return;
    }
    const obs: Point[] = [];
    if (lvl === 3) {
      // Small hazard blocks in 4 quadrants
      for (let i = 4; i <= 6; i++) {
        obs.push({ x: i, y: 5 });
        obs.push({ x: 19 - i, y: 14 });
      }
    } else if (lvl === 5) {
      // Challenging maze walls mimicking Level 5 difficulty
      for (let y = 3; y <= 8; y++) obs.push({ x: 5, y });
      for (let y = 11; y <= 16; y++) obs.push({ x: 14, y });
      for (let x = 8; x <= 12; x++) obs.push({ x, y: 10 });
    }
    setObstacles(obs);
  }, []);

  // Respawn Food avoiding snake & obstacles
  const spawnFood = useCallback((currentSnake: Point[], currentObstacles: Point[]): Point => {
    let newFood: Point;
    let collision: boolean;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision =
        currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
        currentObstacles.some((o) => o.x === newFood.x && o.y === newFood.y);
      attempts++;
    } while (collision && attempts < 100);
    return newFood;