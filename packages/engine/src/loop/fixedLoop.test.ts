import { describe, expect, it, vi } from 'vitest';

import { createFixedLoop, drainAccumulator } from './fixedLoop';

describe('drainAccumulator', () => {
  const dt = 1 / 60;

  it('runs no update when the frame is shorter than one step', () => {
    const update = vi.fn();
    const left = drainAccumulator(0, dt / 2, dt, 1, update);
    expect(update).not.toHaveBeenCalled();
    expect(left).toBeCloseTo(dt / 2);
  });

  it('runs exactly one update for a frame of one step', () => {
    const update = vi.fn();
    const left = drainAccumulator(0, dt, dt, 1, update);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(dt);
    expect(left).toBeCloseTo(0);
  });

  it('runs several updates for a long frame and carries the remainder', () => {
    const update = vi.fn();
    const left = drainAccumulator(0, dt * 3.5, dt, 1, update);
    expect(update).toHaveBeenCalledTimes(3);
    expect(left).toBeCloseTo(dt * 0.5);
  });

  it('accumulates leftovers across frames', () => {
    const update = vi.fn();
    let acc = drainAccumulator(0, dt * 0.6, dt, 1, update);
    acc = drainAccumulator(acc, dt * 0.6, dt, 1, update);
    expect(update).toHaveBeenCalledTimes(1);
    expect(acc).toBeCloseTo(dt * 0.2);
  });

  it('clamps huge frames so the loop never spirals', () => {
    const update = vi.fn();
    drainAccumulator(0, 60, dt, 0.25, update);
    expect(update).toHaveBeenCalledTimes(15);
  });
});

/** Minimal manual scheduler so tests drive frames by hand. */
function createFakeClock() {
  let time = 0;
  const queue: (() => void)[] = [];
  return {
    now: () => time,
    schedule: (callback: () => void) => queue.push(callback),
    cancel: () => {
      queue.length = 0;
    },
    /** Advances the clock and runs the pending frame. */
    tick(ms: number) {
      time += ms;
      const callback = queue.shift();
      callback?.();
    },
    get pending() {
      return queue.length;
    },
  };
}

describe('createFixedLoop', () => {
  it('runs updates at the fixed rate regardless of frame length', () => {
    const clock = createFakeClock();
    const update = vi.fn();
    const render = vi.fn();
    const loop = createFixedLoop({ update, render, ...clock });

    loop.start();
    clock.tick(50);
    expect(update).toHaveBeenCalledTimes(3);
    expect(render).toHaveBeenCalledTimes(1);
    clock.tick(50);
    expect(update).toHaveBeenCalledTimes(6);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('passes the interpolation alpha to render', () => {
    const clock = createFakeClock();
    const render = vi.fn();
    const loop = createFixedLoop({ update: vi.fn(), render, ...clock });
    loop.start();
    clock.tick(25);
    const alpha = render.mock.calls[0]?.[0] as number;
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(1);
    expect(alpha).toBeCloseTo((25 - 16.6667) / 16.6667, 2);
  });

  it('exposes the timestep and measures fps once per second', () => {
    const clock = createFakeClock();
    const loop = createFixedLoop({ update: vi.fn(), render: vi.fn(), ...clock });
    expect(loop.dt).toBeCloseTo(1 / 60);
    loop.start();
    expect(loop.fps).toBe(0);
    for (let i = 0; i < 30; i++) clock.tick(20);
    clock.tick(500);
    expect(loop.fps).toBe(31);
  });

  it('stops scheduling frames after stop()', () => {
    const clock = createFakeClock();
    const update = vi.fn();
    const loop = createFixedLoop({ update, render: vi.fn(), ...clock });
    loop.start();
    expect(loop.running).toBe(true);
    clock.tick(20);
    loop.stop();
    expect(loop.running).toBe(false);
    expect(clock.pending).toBe(0);
    clock.tick(20);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('ignores repeated start and stop calls', () => {
    const clock = createFakeClock();
    const loop = createFixedLoop({ update: vi.fn(), render: vi.fn(), ...clock });
    loop.start();
    loop.start();
    expect(clock.pending).toBe(1);
    loop.stop();
    loop.stop();
    expect(loop.running).toBe(false);
  });
});
