"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Bot, Pause, Play, RotateCcw, Route, ScanSearch } from "lucide-react";
import styles from "@/app/landing/landing.module.css";

type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
type Point = { x: number; y: number };

const GRID = 16;
const INITIAL_SNAKE: Point[] = [
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
];
const TARGETS: Point[] = [
  { x: 11, y: 4 },
  { x: 13, y: 12 },
  { x: 6, y: 13 },
  { x: 2, y: 3 },
  { x: 9, y: 7 },
];
const OBSTACLES: Point[] = [
  { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 },
  { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }, { x: 7, y: 12 }, { x: 7, y: 13 },
  { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
];

const DIRECTIONS: Array<{ direction: Direction; dx: number; dy: number; opposite: Direction }> = [
  { direction: "UP", dx: 0, dy: -1, opposite: "DOWN" },
  { direction: "RIGHT", dx: 1, dy: 0, opposite: "LEFT" },
  { direction: "DOWN", dx: 0, dy: 1, opposite: "UP" },
  { direction: "LEFT", dx: -1, dy: 0, opposite: "RIGHT" },
];

function nextDirection(snake: Point[], target: Point, current: Direction): Direction {
  const head = snake[0];
  const blocked = new Set(OBSTACLES.map((point) => `${point.x},${point.y}`));
  snake.slice(0, -1).forEach((point) => blocked.add(`${point.x},${point.y}`));
  const queue: Array<{ point: Point; first: Direction }> = [];
  const visited = new Set([`${head.x},${head.y}`]);

  for (const move of DIRECTIONS.filter((candidate) => candidate.opposite !== current)) {
    const point = { x: head.x + move.dx, y: head.y + move.dy };
    const key = `${point.x},${point.y}`;
    if (point.x >= 0 && point.x < GRID && point.y >= 0 && point.y < GRID && !blocked.has(key)) {
      visited.add(key);
      queue.push({ point, first: move.direction });
    }
  }

  while (queue.length) {
    const node = queue.shift()!;
    if (node.point.x === target.x && node.point.y === target.y) return node.first;
    for (const move of DIRECTIONS) {
      const point = { x: node.point.x + move.dx, y: node.point.y + move.dy };
      const key = `${point.x},${point.y}`;
      if (point.x >= 0 && point.x < GRID && point.y >= 0 && point.y < GRID && !blocked.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push({ point, first: node.first });
      }
    }
  }

  return current;
}

export function AutonomousPlaytestSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Direction>("RIGHT");
  const targetIndexRef = useRef(0);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [targetIndex, setTargetIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [targetsReached, setTargetsReached] = useState(0);
  const [playing, setPlaying] = useState(true);

  const reset = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE;
    directionRef.current = "RIGHT";
    targetIndexRef.current = 0;
    setSnake(INITIAL_SNAKE);
    setDirection("RIGHT");
    setTargetIndex(0);
    setMoves(0);
    setTargetsReached(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setPlaying(false), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const currentSnake = snakeRef.current;
      const target = TARGETS[targetIndexRef.current];
      const chosen = nextDirection(currentSnake, target, directionRef.current);
      const move = DIRECTIONS.find((candidate) => candidate.direction === chosen)!;
      const head = currentSnake[0];
      const nextHead = { x: head.x + move.dx, y: head.y + move.dy };
      const reached = nextHead.x === target.x && nextHead.y === target.y;
      const nextSnake = [nextHead, ...currentSnake];
      if (!reached) nextSnake.pop();

      directionRef.current = chosen;
      snakeRef.current = nextSnake;
      setDirection(chosen);
      setSnake(nextSnake);
      setMoves((value) => value + 1);

      if (reached) {
        const nextIndex = (targetIndexRef.current + 1) % TARGETS.length;
        targetIndexRef.current = nextIndex;
        setTargetIndex(nextIndex);
        setTargetsReached((value) => value + 1);
      }
    }, 220);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const styles = getComputedStyle(canvas);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    const cell = canvas.width / GRID;

    context.fillStyle = token("--surface-sunken");
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = token("--line");
    context.globalAlpha = 0.34;
    context.lineWidth = 1;
    for (let index = 0; index <= GRID; index += 1) {
      context.beginPath();
      context.moveTo(index * cell, 0);
      context.lineTo(index * cell, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, index * cell);
      context.lineTo(canvas.width, index * cell);
      context.stroke();
    }
    context.globalAlpha = 1;

    for (const obstacle of OBSTACLES) {
      context.fillStyle = token("--critical-surface");
      context.fillRect(obstacle.x * cell + 2, obstacle.y * cell + 2, cell - 4, cell - 4);
      context.strokeStyle = token("--critical");
      context.strokeRect(obstacle.x * cell + 3, obstacle.y * cell + 3, cell - 6, cell - 6);
    }

    const target = TARGETS[targetIndex];
    context.fillStyle = token("--medium");
    context.beginPath();
    context.arc(target.x * cell + cell / 2, target.y * cell + cell / 2, cell * 0.3, 0, Math.PI * 2);
    context.fill();

    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? token("--accent-strong") : token("--accent");
      context.globalAlpha = index === 0 ? 1 : Math.max(0.42, 1 - index / (snake.length + 3));
      context.beginPath();
      context.roundRect(segment.x * cell + 3, segment.y * cell + 3, cell - 6, cell - 6, 4);
      context.fill();
    });
    context.globalAlpha = 1;
  }, [snake, targetIndex]);

  const target = TARGETS[targetIndex];
  const head = snake[0];
  const distance = Math.abs(head.x - target.x) + Math.abs(head.y - target.y);

  return (
    <section id="ai-playtest" className="scroll-mt-20 border-y border-line bg-surface">
      <div className="mx-auto max-w-[76rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.58fr_1.42fr] lg:gap-16">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Watch an autonomous agent test the path.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted">
              The AI playtest follows reachable routes, records each decision, and turns observed friction into evidence your team can review alongside player reports.
            </p>

            <dl className="mt-8 border-t border-line">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line py-4">
                <dt className="text-sm text-muted">Agent</dt>
                <dd className="font-mono text-xs font-semibold text-ink">BFS heuristic</dd>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line py-4">
                <dt className="text-sm text-muted">Environment</dt>
                <dd className="font-mono text-xs font-semibold text-ink">Level 5 testbed</dd>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line py-4">
                <dt className="text-sm text-muted">Capture</dt>
                <dd className="font-mono text-xs font-semibold text-accent">route + attempts</dd>
              </div>
            </dl>
          </div>

          <div className={`min-w-0 overflow-hidden rounded-xl border border-line bg-surface-sunken ${styles.softPanel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-raised px-4 py-3">
              <div className="flex items-center gap-3">
                <Bot className="size-4 text-accent" aria-hidden="true" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink">AI Autonomous Playtest Environment</span>
                <span className="rounded-control bg-accent/15 px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-accent">
                  {playing ? "Running" : "Paused"}
                </span>
              </div>
              <span className="font-mono text-xs text-faint">Sample run</span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="p-3 sm:p-5">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={480}
                  className="mx-auto aspect-square h-auto w-full max-w-[430px] rounded-lg border border-line bg-surface-sunken"
                  role="img"
                  aria-label={`Autonomous snake agent moving ${direction.toLowerCase()} toward target at grid position ${target.x}, ${target.y}. ${targetsReached} targets reached.`}
                />
              </div>

              <div className="border-t border-line lg:border-l lg:border-t-0">
                <div className="border-b border-line px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Activity className="size-4 text-accent" aria-hidden="true" />
                    Live decision rundown
                  </div>
                </div>
                <div className="grid grid-cols-3 border-b border-line lg:grid-cols-1">
                  <div className="border-r border-line px-3 py-4 lg:border-b lg:border-r-0 lg:px-4">
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-faint">Moves</div>
                    <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">{moves}</div>
                  </div>
                  <div className="border-r border-line px-3 py-4 lg:border-b lg:border-r-0 lg:px-4">
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-faint">Targets</div>
                    <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-accent">{targetsReached}</div>
                  </div>
                  <div className="px-3 py-4 lg:border-b lg:px-4">
                    <div className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-faint">Distance</div>
                    <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">{distance}</div>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-5 text-sm">
                  <div className="flex items-start gap-3">
                    <ScanSearch className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
                    <p className="leading-6 text-muted">Scanning collision map and target position.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Route className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <p className="leading-6 text-muted">Shortest safe route selected: <span className="font-mono text-xs font-semibold text-ink">{direction}</span></p>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-line p-4">
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-control bg-accent px-3 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong"
                  >
                    {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                    {playing ? "Pause agent" : "Resume agent"}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink transition-colors hover:bg-surface-raised"
                    aria-label="Restart sample playtest"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
