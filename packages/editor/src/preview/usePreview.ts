import {
  buildSpriteAtlas,
  CanvasRenderer,
  createFixedLoop,
  createPlaceholderManifest,
  IDLE_INPUT,
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  Simulation,
  type FixedLoop,
  type Pattern,
} from '@gds/engine';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';

export interface PreviewStats {
  readonly fps: number;
  readonly bullets: number;
  readonly time: number;
  readonly hits: number;
}

const EMPTY_STATS: PreviewStats = { fps: 0, bullets: 0, time: 0, hits: 0 };

/** How often the stats state is refreshed. Rendering runs every frame regardless. */
const STATS_INTERVAL_MS = 250;

/**
 * Owns the engine objects behind the live preview: sprite atlas, renderer,
 * fixed loop and the current simulation. React only sees a small stats object
 * refreshed a few times per second, so the frame loop never triggers renders.
 */
export function usePreview(pattern: Pattern | null, debounceMs = 120) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<Simulation | null>(null);
  const loopRef = useRef<FixedLoop | null>(null);
  const targetRef = useRef<{ x: number; y: number } | null>(null);

  const [stats, setStats] = useState<PreviewStats>(EMPTY_STATS);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let disposed = false;
    let observer: ResizeObserver | null = null;

    buildSpriteAtlas(createPlaceholderManifest())
      .then((atlas) => {
        if (disposed) return;
        const renderer = new CanvasRenderer(canvas, atlas);
        const fit = (): void => renderer.resize(container.clientWidth, container.clientHeight);
        fit();
        observer = new ResizeObserver(fit);
        observer.observe(container);

        let lastStatsAt = 0;
        const loop = createFixedLoop({
          update(dt) {
            const sim = simRef.current;
            if (!sim) return;
            const target = targetRef.current;
            if (target) {
              sim.player.x = target.x;
              sim.player.y = target.y;
            }
            sim.setPlayerInput(IDLE_INPUT);
            sim.step(dt);
            if (sim.finished) sim.reset();
          },
          render() {
            const sim = simRef.current;
            if (!sim) return;
            renderer.render(sim);
            const now = performance.now();
            if (now - lastStatsAt >= STATS_INTERVAL_MS) {
              lastStatsAt = now;
              setStats({
                fps: loop.fps,
                bullets: sim.bullets.count,
                time: sim.time,
                hits: sim.hits,
              });
            }
          },
        });
        loopRef.current = loop;
        loop.start();
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : String(reason));
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      loopRef.current?.stop();
      loopRef.current = null;
    };
  }, []);

  // Swap the simulation when the validated pattern changes, after a short debounce
  // so dragging a slider does not allocate a pool per pixel.
  useEffect(() => {
    if (!pattern) return;
    const handle = window.setTimeout(() => {
      simRef.current = new Simulation({ pattern });
    }, debounceMs);
    return () => window.clearTimeout(handle);
  }, [pattern, debounceMs]);

  const restart = useCallback(() => {
    simRef.current?.reset();
  }, []);

  const togglePause = useCallback(() => {
    const loop = loopRef.current;
    if (!loop) return;
    if (loop.running) loop.stop();
    else loop.start();
    setPaused(!loop.running);
  }, []);

  /** Moves the preview player to the mouse so aimed emitters have a live target. */
  const onMouseMove = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * PLAYFIELD_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * PLAYFIELD_HEIGHT;
    targetRef.current = {
      x: Math.min(Math.max(x, 0), PLAYFIELD_WIDTH),
      y: Math.min(Math.max(y, 0), PLAYFIELD_HEIGHT),
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    targetRef.current = null;
  }, []);

  return {
    containerRef,
    canvasRef,
    stats,
    paused,
    error,
    restart,
    togglePause,
    onMouseMove,
    onMouseLeave,
  };
}
