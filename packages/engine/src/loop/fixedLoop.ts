import { FIXED_UPDATES_PER_SECOND } from '../constants';

export interface FixedLoopOptions {
  /** Called with a constant `dt` in seconds, zero or more times per frame. */
  readonly update: (dt: number) => void;
  /** Called once per frame. `alpha` in [0, 1) is how far we are into the next update. */
  readonly render: (alpha: number) => void;
  readonly updatesPerSecond?: number;
  /**
   * Longest frame the loop will simulate, in seconds. Longer gaps (a background
   * tab, a debugger pause) are clamped so the loop never spirals trying to catch up.
   */
  readonly maxFrameSeconds?: number;
  /** Clock in milliseconds. Defaults to performance.now. Injected for tests. */
  readonly now?: () => number;
  /** Frame scheduler. Defaults to requestAnimationFrame. Injected for tests. */
  readonly schedule?: (callback: () => void) => number;
  readonly cancel?: (handle: number) => void;
}

export interface FixedLoop {
  start(): void;
  stop(): void;
  readonly running: boolean;
  /** Rendered frames per second, measured over the last second. */
  readonly fps: number;
  /** The constant timestep passed to `update`, in seconds. */
  readonly dt: number;
}

/**
 * Pure accumulator step shared by the loop and its tests: drains whole
 * timesteps from `accumulator + frameSeconds` and returns what is left.
 */
export function drainAccumulator(
  accumulator: number,
  frameSeconds: number,
  dt: number,
  maxFrameSeconds: number,
  update: (dt: number) => void,
): number {
  let remaining = accumulator + Math.min(frameSeconds, maxFrameSeconds);
  while (remaining >= dt) {
    update(dt);
    remaining -= dt;
  }
  return remaining;
}

/**
 * Fixed-timestep game loop. The simulation always advances in constant steps,
 * so behaviour does not depend on the display refresh rate, while rendering
 * runs as often as the browser paints.
 */
export function createFixedLoop(options: FixedLoopOptions): FixedLoop {
  const dt = 1 / (options.updatesPerSecond ?? FIXED_UPDATES_PER_SECOND);
  const maxFrameSeconds = options.maxFrameSeconds ?? 0.25;
  const now = options.now ?? (() => performance.now());
  const schedule = options.schedule ?? ((callback) => requestAnimationFrame(callback));
  const cancel = options.cancel ?? ((handle) => cancelAnimationFrame(handle));

  let running = false;
  let handle = 0;
  let lastTime = 0;
  let accumulator = 0;
  let fps = 0;
  let framesThisSecond = 0;
  let fpsWindowStart = 0;

  const frame = (): void => {
    if (!running) return;
    const current = now();
    const frameSeconds = (current - lastTime) / 1000;
    lastTime = current;

    accumulator = drainAccumulator(accumulator, frameSeconds, dt, maxFrameSeconds, options.update);
    options.render(accumulator / dt);

    framesThisSecond++;
    if (current - fpsWindowStart >= 1000) {
      fps = framesThisSecond;
      framesThisSecond = 0;
      fpsWindowStart = current;
    }

    handle = schedule(frame);
  };

  return {
    get running() {
      return running;
    },
    get fps() {
      return fps;
    },
    dt,
    start() {
      if (running) return;
      running = true;
      lastTime = now();
      fpsWindowStart = lastTime;
      accumulator = 0;
      framesThisSecond = 0;
      handle = schedule(frame);
    },
    stop() {
      if (!running) return;
      running = false;
      cancel(handle);
    },
  };
}
