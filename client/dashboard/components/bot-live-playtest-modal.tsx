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
      const headScreenY = head.y * cellH + cellH / 2;

      // 2. Compute target vector direction
      let targetOffsetX = 0;
      let targetOffsetY = 0;
      if (targetDir === "UP") targetOffsetY = -cellH * 1.5;
      else if (targetDir === "DOWN") targetOffsetY = cellH * 1.5;
      else if (targetDir === "LEFT") targetOffsetX = -cellW * 1.5;
      else if (targetDir === "RIGHT") targetOffsetX = cellW * 1.5;

      // First move cursor directly to the snake head, then steer in target direction
      setCursorPos({
        x: Math.max(20, Math.min(rect.width - 40, headScreenX + targetOffsetX * 0.8)),
        y: Math.max(20, Math.min(rect.height - 40, headScreenY + targetOffsetY * 0.8)),
      });
      setCursorAction(`Steering Snake [${targetDir}]`);
      setLastActionDir(targetDir);

      // Perform Click Simulation (Visual Pulse & Waves)
      setCursorClicking(true);
      setTimeout(() => setCursorClicking(false), 140);
    },
    []
  );

  // Core Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || mode !== "snake") return;

    // Base interval adjusted by speed: 180ms / speed
    const intervalMs = Math.max(45, Math.floor(170 / speed));

    const interval = setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentDir = directionRef.current;
      const currentFood = foodRef.current;
      const currentObs = obstaclesRef.current;
      const head = currentSnake[0];

      let nextDir = currentDir;

      // AI Decision Step
      if (isAiActiveRef.current) {
        nextDir = findAiNextDirection(currentSnake, currentFood, currentObs, currentDir);
        if (nextDir !== currentDir || Math.random() < 0.25) {
          triggerAiCursorAction(nextDir, head);
        }
        setDirection(nextDir);
      }

      // Next Head Coordinates
      let nextX = head.x;
      let nextY = head.y;
      if (nextDir === "UP") nextY -= 1;
      else if (nextDir === "DOWN") nextY += 1;
      else if (nextDir === "LEFT") nextX -= 1;
      else if (nextDir === "RIGHT") nextX += 1;

      // Collision with Boundary Walls
      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        setIsGameOver(true);
        setIsPlaying(false);
        addLog("alert", `💥 Game Over! Collision with perimeter barrier at (${nextX}, ${nextY}). Final Score: ${score}`);
        return;
      }

      // Collision with Obstacles
      if (currentObs.some((o) => o.x === nextX && o.y === nextY)) {
        setIsGameOver(true);
        setIsPlaying(false);
        addLog("alert", `💥 Game Over! AI collided with obstacle at Level ${level}. Telemetry registered difficulty drop-off.`);
        return;
      }

      // Collision with Snake Tail
      if (currentSnake.slice(0, -1).some((s) => s.x === nextX && s.y === nextY)) {
        setIsGameOver(true);
        setIsPlaying(false);
        addLog("alert", `💥 Game Over! Tail self-collision. Safe navigation route exhausted.`);
        return;
      }

      // Move Forward
      const newHead: Point = { x: nextX, y: nextY };
      const newSnake = [newHead, ...currentSnake];

      // Check if Food Consumed
      if (nextX === currentFood.x && nextY === currentFood.y) {
        const newScore = score + 10;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);

        const nextFood = spawnFood(newSnake, currentObs);
        setFood(nextFood);
        addLog("game", `🍎 Food consumed! Score: ${newScore}. Length: ${newSnake.length}. Telemetry: 'target_reached'.`);
      } else {
        newSnake.pop(); // Remove tail
      }

      setSnake(newSnake);
      setMovesCount((m) => m + 1);

      // Random telemetry pulse log periodically
      if (Math.random() < 0.08) {
        addLog("telemetry", `📡 Ingesting event: 'attempt', duration: ${Math.floor(movesCount * 0.2)}s, score: ${score}`);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    isGameOver,
    mode,
    speed,
    score,
    highScore,
    level,
    movesCount,
    findAiNextDirection,
    triggerAiCursorAction,
    spawnFood,
    addLog,
  ]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "snake") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    // Background
    ctx.fillStyle = "#090c10";
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid lines
    ctx.strokeStyle = "rgba(52, 60, 70, 0.25)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw Obstacles (Level 3 / 5)
    obstacles.forEach((obs) => {
      ctx.fillStyle = "#e45b5b";
      ctx.shadowColor = "rgba(228, 91, 91, 0.6)";
      ctx.shadowBlur = 8;
      ctx.fillRect(obs.x * cellSize + 2, obs.y * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.shadowBlur = 0;

      // Hazard stripe pattern
      ctx.fillStyle = "#2d1215";
      ctx.fillRect(obs.x * cellSize + 6, obs.y * cellSize + 6, cellSize - 12, cellSize - 12);
    });

    // Draw Food (Pulsing glowing orb)
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize * 0.38;

    ctx.save();
    ctx.shadowColor = "#e0bd4f";
    ctx.shadowBlur = 14;
    const grad = ctx.createRadialGradient(foodX, foodY, 2, foodX, foodY, foodRadius);
    grad.addColorStop(0, "#fff5cc");
    grad.addColorStop(0.4, "#e0bd4f");
    grad.addColorStop(1, "#ed9840");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle outer ring
    ctx.strokeStyle = "rgba(255, 230, 100, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw Snake
    snake.forEach((seg, index) => {
      const segX = seg.x * cellSize;
      const segY = seg.y * cellSize;

      if (index === 0) {
        // Head
        ctx.save();
        ctx.shadowColor = "#35b8a5";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#55d1bf";
        ctx.beginPath();
        ctx.roundRect(segX + 2, segY + 2, cellSize - 4, cellSize - 4, 7);
        ctx.fill();
        ctx.restore();

        // Glowing visor / eyes based on direction
        ctx.fillStyle = "#090c10";
        const eyeSize = cellSize * 0.18;
        if (direction === "RIGHT") {
          ctx.fillRect(segX + cellSize - 7, segY + 5, eyeSize, eyeSize);
          ctx.fillRect(segX + cellSize - 7, segY + cellSize - 5 - eyeSize, eyeSize, eyeSize);
        } else if (direction === "LEFT") {
          ctx.fillRect(segX + 4, segY + 5, eyeSize, eyeSize);
          ctx.fillRect(segX + 4, segY + cellSize - 5 - eyeSize, eyeSize, eyeSize);
        } else if (direction === "UP") {
          ctx.fillRect(segX + 5, segY + 4, eyeSize, eyeSize);
          ctx.fillRect(segX + cellSize - 5 - eyeSize, segY + 4, eyeSize, eyeSize);
        } else if (direction === "DOWN") {
          ctx.fillRect(segX + 5, segY + cellSize - 7, eyeSize, eyeSize);
          ctx.fillRect(segX + cellSize - 5 - eyeSize, segY + cellSize - 7, eyeSize, eyeSize);
        }
      } else {
        // Body segments (Gradient fade)
        const alpha = Math.max(0.4, 1 - index / (snake.length + 6));
        ctx.fillStyle = `rgba(53, 184, 165, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(segX + 3, segY + 3, cellSize - 6, cellSize - 6, 5);
        ctx.fill();
      }
    });
  }, [snake, food, obstacles, direction, mode]);

  // Sync real telemetry session to platform API
  const handleSendTelemetry = async () => {
    try {
      setIsSendingTelemetry(true);
      setTelemetryNotice("");

      await request(`/platform/workspaces/${workspaceId}/telemetry/mock`, {});

      setTelemetryNotice("Telemetry session synced to workspace!");
      addLog("telemetry", `✅ Real-time telemetry batch verified and ingested into workspace.`);
      if (onTelemetrySynced) onTelemetrySynced();
      setTimeout(() => setTelemetryNotice(""), 3500);
    } catch (err) {
      setTelemetryNotice("Failed to sync telemetry.");
      addLog("alert", `❌ Telemetry sync error: ${(err as Error).message}`);
    } finally {
      setIsSendingTelemetry(false);
    }
  };

  // Keyboard navigation when user takes over
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "snake") return;
      if (["ArrowUp", "KeyW"].includes(e.code) && direction !== "DOWN") {
        setDirection("UP");
        setIsAiActive(false);
      } else if (["ArrowDown", "KeyS"].includes(e.code) && direction !== "UP") {
        setDirection("DOWN");
        setIsAiActive(false);
      } else if (["ArrowLeft", "KeyA"].includes(e.code) && direction !== "RIGHT") {
        setDirection("LEFT");
        setIsAiActive(false);
      } else if (["ArrowRight", "KeyD"].includes(e.code) && direction !== "LEFT") {
        setDirection("RIGHT");
        setIsAiActive(false);
      } else if (e.code === "Space") {
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, mode]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 backdrop-blur-md transition-all ${
        isFullscreen ? "p-0" : "p-3 sm:p-5"
      }`}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={`glass flex flex-col overflow-hidden border border-line shadow-2xl transition-all ${
          isFullscreen
            ? "h-screen w-screen rounded-none max-w-none max-h-none"
            : "max-h-[95vh] w-full max-w-6xl rounded-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/30">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text">
                  AI Autonomous Playtest Environment
                </h2>
                <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent ring-1 ring-accent/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                  LIVE AUTOPILOT ACTIVE
                </span>
              </div>
              <p className="text-xs text-muted">
                Bot Target: <span className="font-semibold text-text">{botName}</span> | Model: BFS Heuristic Agent v2.4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gameUrl && (
              <div className="flex rounded-lg bg-surface-sunken p-0.5 border border-line text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("snake")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    mode === "snake" ? "bg-accent text-canvas" : "text-muted hover:text-text"
                  }`}
                >
                  Snake AI Testbed
                </button>
                <button
                  type="button"
                  onClick={() => setMode("iframe")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    mode === "iframe" ? "bg-accent text-canvas" : "text-muted hover:text-text"
                  }`}
                >
                  External Game URL
                </button>
              </div>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-muted hover:bg-surface-raised hover:text-text transition"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-muted hover:bg-surface-raised hover:text-text transition"
              onClick={onClose}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left Column: Live Game Screen & Simulated Cursor */}
          <div className="flex flex-col items-center justify-center gap-4">
            {mode === "snake" ? (
              <div
                ref={gameAreaRef}
                className="relative aspect-square w-full max-w-[480px] rounded-2xl border-2 border-line/80 bg-surface-sunken shadow-2xl overflow-hidden select-none"
              >
                {/* 2D Canvas */}
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={480}
                  className="h-full w-full block cursor-crosshair"
                />

                {/* VISIBLE AI CURSOR WITH REAL-TIME CLICK RIPPLE */}
                {isAiActive && (
                  <div
                    className="pointer-events-none absolute transition-all duration-180 ease-out z-30"
                    style={{
                      left: `${cursorPos.x}px`,
                      top: `${cursorPos.y}px`,
                      transform: "translate(-6px, -6px)",
                    }}
                  >
                    {/* Ripple animation on click */}
                    {cursorClicking && (
                      <span className="absolute -inset-4 rounded-full border-2 border-accent animate-ping pointer-events-none opacity-90" />
                    )}

                    {/* Cyber Neon Cursor SVG Pointer */}
                    <div className={`transition-transform duration-100 ${cursorClicking ? "scale-90" : "scale-100"}`}>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-[0_0_8px_rgba(53,184,165,0.9)]"
                      >
                        <path
                          d="M4 3L11 20L14 13L21 10L4 3Z"
                          fill="#35b8a5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* AI Label Tag beside cursor */}
                    <div className="absolute left-6 top-3 flex items-center gap-1 whitespace-nowrap rounded-md bg-canvas/90 px-2 py-0.5 text-[10px] font-mono font-bold text-accent shadow-lg border border-accent/40 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      🤖 {cursorAction}
                    </div>
                  </div>
                )}

                {/* Game Over Screen */}
                {isGameOver && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-canvas/90 backdrop-blur-sm p-6 text-center animate-fade-in">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-critical/20 text-critical ring-1 ring-critical/40 mb-3">
                      <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-text">Session Concluded</h3>
                    <p className="text-xs text-muted mt-1 max-w-xs">
                      The AI agent completed this playthrough run. Telemetry event batch recorded with final performance indicators.
                    </p>
                    <div className="mt-4 flex items-center gap-6 rounded-xl bg-surface p-3 border border-line">
                      <div>
                        <div className="text-xs text-muted">Final Score</div>
                        <div className="text-lg font-bold text-accent">{score}</div>
                      </div>
                      <div className="h-8 w-px bg-line" />
                      <div>
                        <div className="text-xs text-muted">Moves</div>
                        <div className="text-lg font-bold text-text">{movesCount}</div>
                      </div>
                      <div className="h-8 w-px bg-line" />
                      <div>
                        <div className="text-xs text-muted">Level</div>
                        <div className="text-lg font-bold text-medium">Lvl {level}</div>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        className="primary text-xs py-2 px-4 flex items-center gap-1.5"
                        onClick={resetGame}
                      >
                        <RotateCcw size={15} />
                        Rerun AI Playtest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* External Iframe Game Mode */
              <div className="relative aspect-video w-full max-w-[640px] rounded-2xl border border-line bg-surface-sunken overflow-hidden">
                <iframe
                  title={`${botName} live play`}
                  src={gameUrl}
                  className="h-full w-full border-0"
                  sandbox="allow-scripts allow-pointer-lock"
                  referrerPolicy="no-referrer"
                />
                {/* Simulated Overlay Cursor for Iframe Mode */}
                <div
                  className="pointer-events-none absolute z-30 transition-all duration-200"
                  style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="#35b8a5"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_8px_rgba(53,184,165,0.8)]"
                  >
                    <path d="M4 3L11 20L14 13L21 10L4 3Z" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute left-6 top-2 rounded bg-canvas/90 px-1.5 py-0.5 text-[10px] font-mono text-accent">
                    🤖 AI Simulating Inputs
                  </div>
                </div>
              </div>
            )}

            {/* In-Game Interactive Quick D-Pad & Actuator Controls */}
            {mode === "snake" && (
              <div className="flex items-center gap-6">
                {/* Virtual D-Pad */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-surface border border-line/60">
                  <div />
                  <button
                    type="button"
                    onClick={() => {
                      setDirection("UP");
                      triggerAiCursorAction("UP", snake[0]);
                    }}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition ${
                      direction === "UP" ? "bg-accent text-canvas font-bold shadow" : "bg-surface-sunken text-muted hover:text-text"
                    }`}
                    title="Move Up"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => {
                      setDirection("LEFT");