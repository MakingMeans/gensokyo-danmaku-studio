import { angleBetween, degToRad } from '../math/angles';
import type { Emitter } from '../pattern/schema';
import { SPRITE_DEFINITIONS, spriteIndex, type SpriteKey } from '../sprites/spriteKeys';
import type { BulletPool } from './bulletPool';
import { ringAngle, spiralAngle, spreadAngle, spunAngle } from './emitterMath';

/** Mutable per-emitter state. The definition itself is never modified. */
export interface EmitterRuntime {
  readonly def: Emitter;
  /** Simulation time at which the next shot fires. */
  nextShotAt: number;
  shotsFired: number;
}

/** What an emitter needs from the world in order to fire. */
export interface EmitterContext {
  readonly pool: BulletPool;
  readonly playerX: number;
  readonly playerY: number;
}

export function createEmitterRuntime(def: Emitter): EmitterRuntime {
  return { def, nextShotAt: def.start, shotsFired: 0 };
}

export function resetEmitterRuntime(runtime: EmitterRuntime): void {
  runtime.nextShotAt = runtime.def.start;
  runtime.shotsFired = 0;
}

/**
 * Fires every shot that is due at or before `time`. Shots are stamped with
 * their scheduled time, not the tick time, so spin stays exact regardless of
 * how the interval aligns with the fixed timestep.
 */
export function updateEmitter(runtime: EmitterRuntime, time: number, ctx: EmitterContext): void {
  const { def } = runtime;
  while (runtime.nextShotAt <= time) {
    if (def.count !== undefined && runtime.shotsFired >= def.count) return;
    fireShot(def, runtime.nextShotAt, ctx);
    runtime.shotsFired++;
    runtime.nextShotAt += def.interval;
  }
}

function fireShot(def: Emitter, shotTime: number, ctx: EmitterContext): void {
  let base = spunAngle(def.angle, def.spin, shotTime - def.start);
  if (def.aimed) {
    base += angleBetween(def.x, def.y, ctx.playerX, ctx.playerY);
  }

  switch (def.type) {
    case 'ring':
      for (let i = 0; i < def.bullets; i++) {
        spawnBullet(def, ringAngle(i, def.bullets, base), ctx.pool);
      }
      break;
    case 'spread':
      for (let i = 0; i < def.bullets; i++) {
        spawnBullet(def, spreadAngle(i, def.bullets, def.spread, base), ctx.pool);
      }
      break;
    case 'spiral':
      for (let i = 0; i < def.streams; i++) {
        spawnBullet(def, spiralAngle(i, def.streams, base), ctx.pool);
      }
      break;
  }
}

function spawnBullet(def: Emitter, angleDeg: number, pool: BulletPool): void {
  const angle = degToRad(angleDeg);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // The schema guarantees the sprite key exists in the catalogue.
  const key = def.sprite as SpriteKey;
  pool.spawn(
    def.x,
    def.y,
    def.speed * cos,
    def.speed * sin,
    def.acceleration * cos,
    def.acceleration * sin,
    SPRITE_DEFINITIONS[key].radius,
    spriteIndex(key),
  );
}
