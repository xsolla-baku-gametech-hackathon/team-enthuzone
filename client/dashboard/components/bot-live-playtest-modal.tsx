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
  }, []);

  // Reset Game
  const resetGame = useCallback(() => {
    const initialSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    setSnake(initialSnake);
    setDirection("RIGHT");
    initLevelObstacles(level);
    const newFood = spawnFood(initialSnake, obstaclesRef.current);
    setFood(newFood);
    setScore(0);
    setMovesCount(0);
    setIsGameOver(false);
    setIsPlaying(true);
    addLog("game", "🎮 New AI Playtest session launched. Grid initialized.");
  }, [addLog, initLevelObstacles, level, spawnFood]);

  // Handle Level Switch
  const handleLevelChange = (newLevel: 1 | 3 | 5) => {
    setLevel(newLevel);
    initLevelObstacles(newLevel);
    addLog("alert", `⚠️ Difficulty adjusted: Level ${newLevel} (${newLevel === 5 ? "High Dropout Zone" : newLevel === 3 ? "Medium Obstacles" : "Onboarding"})`);
    resetGame();
  };

  // BFS Pathfinder for AI
  const findAiNextDirection = useCallback(
    (currentSnake: Point[], currentFood: Point, currentObstacles: Point[], currentDir: Direction): Direction => {
      const head = currentSnake[0];
      const blocked = new Set<string>();

      // Snake body (excluding tail end since it moves)
      currentSnake.slice(0, -1).forEach((seg) => blocked.add(`${seg.x},${seg.y}`));
      // Obstacles
      currentObstacles.forEach((obs) => blocked.add(`${obs.x},${obs.y}`));

      const dirs: { dir: Direction; dx: number; dy: number; opposite: Direction }[] = [
        { dir: "UP", dx: 0, dy: -1, opposite: "DOWN" },
        { dir: "RIGHT", dx: 1, dy: 0, opposite: "LEFT" },
        { dir: "DOWN", dx: 0, dy: 1, opposite: "UP" },
        { dir: "LEFT", dx: -1, dy: 0, opposite: "RIGHT" },
      ];

      // Disallow 180-degree instant reversal
      const validMoves = dirs.filter((d) => d.opposite !== currentDir);

      // BFS to find shortest path to Food
      type QueueNode = { pt: Point; firstDir: Direction };
      const queue: QueueNode[] = [];
      const visited = new Set<string>();
      visited.add(`${head.x},${head.y}`);

      for (const m of validMoves) {
        const nx = head.x + m.dx;
        const ny = head.y + m.dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !blocked.has(key)) {
          visited.add(key);
          queue.push({ pt: { x: nx, y: ny }, firstDir: m.dir });
        }
      }

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr.pt.x === currentFood.x && curr.pt.y === currentFood.y) {
          return curr.firstDir;
        }

        for (const d of dirs) {
          const nx = curr.pt.x + d.dx;
          const ny = curr.pt.y + d.dy;
          const key = `${nx},${ny}`;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !blocked.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ pt: { x: nx, y: ny }, firstDir: curr.firstDir });
          }
        }
      }

      // Fallback: If no direct path to food, pick the move that maximizes open space (longest survival)
      let bestDir: Direction = currentDir;
      let maxSpace = -1;

      for (const m of validMoves) {
        const nx = head.x + m.dx;
        const ny = head.y + m.dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !blocked.has(key)) {
          // Count open neighbours
          let space = 0;
          for (const check of dirs) {
            const cx = nx + check.dx;
            const cy = ny + check.dy;
            if (cx >= 0 && cx < GRID_SIZE && cy >= 0 && cy < GRID_SIZE && !blocked.has(`${cx},${cy}`)) {
              space++;
            }
          }
          if (space > maxSpace) {
            maxSpace = space;
            bestDir = m.dir;
          }
        }
      }

      return bestDir;
    },
    []
  );

  // Trigger Visible AI Cursor Movement and Physical Click on Snake/Controls
  const triggerAiCursorAction = useCallback(
    (targetDir: Direction, head: Point) => {
      if (!gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;

      // 1. Position of the Snake Head on screen
      const headScreenX = head.x * cellW + cellW / 2;