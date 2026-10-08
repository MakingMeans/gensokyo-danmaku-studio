import { describe, expect, it } from 'vitest';

import { emitterSchema, type Emitter } from '../pattern/schema';
import { BulletPool } from './bulletPool';
import { createEmitterRuntime, updateEmitter, type EmitterContext } from './emitter';

/** Builds an emitter through the schema so defaults match real patterns. */
function emitter(input: Record<string, unknown>): Emitter {
  return emitterSchema.parse(input);
}

function context(pool: BulletPool, playerX = 192, playerY = 400): EmitterContext {
  return { pool, playerX, playerY };
}

/** Live bullet angles in degrees, sorted, derived from velocity. */
function angles(pool: BulletPool): number[] {
  const out: number[] = [];
  for (let i = 0; i < pool.count; i++) {
    const deg = (Math.atan2(pool.vy[i], pool.vx[i]) * 180) / Math.PI;
    out.push(Math.round(((deg % 360) + 360) % 360));
  }
  return out.sort((a, b) => a - b);
}

describe('updateEmitter', () => {
  it('does not fire before its start time', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'ring', start: 1, interval: 0.5, bullets: 4, speed: 10 }),
    );
    updateEmitter(rt, 0.99, context(pool));
    expect(pool.count).toBe(0);
    updateEmitter(rt, 1, context(pool));
    expect(pool.count).toBe(4);
  });

  it('fires once per interval and catches up on missed shots', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'ring', interval: 0.5, bullets: 1, speed: 10 }),
    );
    updateEmitter(rt, 0, context(pool));
    expect(pool.count).toBe(1);
    updateEmitter(rt, 0.4, context(pool));
    expect(pool.count).toBe(1);
    updateEmitter(rt, 2, context(pool));
    expect(pool.count).toBe(5);
    expect(rt.shotsFired).toBe(5);
  });

  it('stops after the configured shot count', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'ring', interval: 0.1, bullets: 2, count: 3, speed: 10 }),
    );
    updateEmitter(rt, 10, context(pool));
    expect(pool.count).toBe(6);
    expect(rt.shotsFired).toBe(3);
  });

  it('spawns ring bullets evenly around the circle', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(emitter({ type: 'ring', interval: 1, bullets: 4, speed: 100 }));
    updateEmitter(rt, 0, context(pool));
    expect(angles(pool)).toEqual([0, 90, 180, 270]);
    expect(Math.hypot(pool.vx[0], pool.vy[0])).toBeCloseTo(100);
  });

  it('spawns spread bullets inside the fan centred on the base angle', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'spread', interval: 1, bullets: 3, spread: 60, angle: 90, speed: 50 }),
    );
    updateEmitter(rt, 0, context(pool));
    expect(angles(pool)).toEqual([60, 90, 120]);
  });

  it('spawns one bullet per spiral stream', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'spiral', interval: 1, streams: 3, spin: 90, speed: 50 }),
    );
    updateEmitter(rt, 0, context(pool));
    expect(angles(pool)).toEqual([0, 120, 240]);
  });

  it('applies spin based on the scheduled shot time', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'spiral', interval: 0.5, streams: 1, spin: 90, speed: 50 }),
    );
    // The tick lands late at 0.7s, but the second shot was due at 0.5s: 45 degrees of spin.
    updateEmitter(rt, 0.7, context(pool));
    expect(angles(pool)).toEqual([0, 45]);
  });

  it('aims at the player when aimed is true', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({ type: 'spread', interval: 1, bullets: 1, spread: 0, speed: 50, aimed: true }),
    );
    // Emitter defaults to (192, 112); player straight below means 90 degrees.
    updateEmitter(rt, 0, context(pool, 192, 400));
    expect(angles(pool)).toEqual([90]);
  });

  it('stores velocity, acceleration, radius and sprite index for each bullet', () => {
    const pool = new BulletPool(64);
    const rt = createEmitterRuntime(
      emitter({
        type: 'ring',
        interval: 1,
        bullets: 1,
        speed: 100,
        acceleration: 20,
        angle: 90,
        sprite: 'star-yellow',
        x: 10,
        y: 20,
      }),
    );
    updateEmitter(rt, 0, context(pool));
    expect(pool.x[0]).toBe(10);
    expect(pool.y[0]).toBe(20);
    expect(pool.vx[0]).toBeCloseTo(0);
    expect(pool.vy[0]).toBeCloseTo(100);
    expect(pool.ax[0]).toBeCloseTo(0);
    expect(pool.ay[0]).toBeCloseTo(20);
    expect(pool.radius[0]).toBe(5);
    expect(pool.sprite[0]).toBe(7);
  });

  it('drops bullets silently when the pool is full', () => {
    const pool = new BulletPool(3);
    const rt = createEmitterRuntime(emitter({ type: 'ring', interval: 1, bullets: 8, speed: 10 }));
    updateEmitter(rt, 0, context(pool));
    expect(pool.count).toBe(3);
  });
});
