import { DEFAULT_BULLET_CAPACITY, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';
import { createRng, type Rng } from '../math/rng';
import type { Pattern } from '../pattern/schema';
import { BulletPool } from './bulletPool';
import { findBulletHit } from './collision';
import {
  createEmitterRuntime,
  resetEmitterRuntime,
  updateEmitter,
  type EmitterRuntime,
} from './emitter';
import {
  createPlayer,
  IDLE_INPUT,
  isInvulnerable,
  resetPlayer,
  updatePlayer,
  type PlayerConfig,
  type PlayerInput,
  type PlayerState,
} from './player';

export interface SimulationOptions {
  readonly pattern: Pattern;
  /** Maximum live bullets. Defaults to DEFAULT_BULLET_CAPACITY. */
  readonly capacity?: number;
  readonly playerConfig?: PlayerConfig;
}

/** Bullets further than this outside the playfield are recycled. */
const CULL_MARGIN = 32;

/**
 * Runs one pattern against one player. Pure TypeScript with no DOM access, so
 * it can be driven by tests, the game loop or the editor preview alike.
 *
 * Call `step(dt)` with a fixed `dt`; the simulation does not care about wall
 * clock time, which is what makes it deterministic.
 */
export class Simulation {
  readonly pattern: Pattern;
  readonly bullets: BulletPool;
  readonly player: PlayerState;
  readonly rng: Rng;

  /** Seconds elapsed since the pattern started. */
  time = 0;
  /** Number of times the player has been hit. */
  hits = 0;

  private readonly emitters: readonly EmitterRuntime[];
  private input: PlayerInput = IDLE_INPUT;

  constructor(options: SimulationOptions) {
    this.pattern = options.pattern;
    this.bullets = new BulletPool(options.capacity ?? DEFAULT_BULLET_CAPACITY);
    this.player = createPlayer(options.playerConfig);
    this.rng = createRng(options.pattern.seed);
    this.emitters = options.pattern.emitters.map(createEmitterRuntime);
  }

  /** True once the pattern duration has elapsed; emitters stop firing. */
  get patternEnded(): boolean {
    return this.time >= this.pattern.duration;
  }

  /** True once the pattern has ended and every bullet has left the screen. */
  get finished(): boolean {
    return this.patternEnded && this.bullets.count === 0;
  }

  setPlayerInput(input: PlayerInput): void {
    this.input = input;
  }

  /** Advances the world by `dt` seconds. Meant to be called with a fixed timestep. */
  step(dt: number): void {
    this.time += dt;

    updatePlayer(this.player, this.input, dt);

    if (!this.patternEnded) {
      const ctx = { pool: this.bullets, playerX: this.player.x, playerY: this.player.y };
      for (const emitter of this.emitters) {
        updateEmitter(emitter, this.time, ctx);
      }
    }

    this.bullets.integrate(dt);
    this.bullets.cullOutside(
      -CULL_MARGIN,
      -CULL_MARGIN,
      PLAYFIELD_WIDTH + CULL_MARGIN,
      PLAYFIELD_HEIGHT + CULL_MARGIN,
    );

    this.resolvePlayerHit();
  }

  /** Returns the simulation to its initial state without reallocating the pool. */
  reset(): void {
    this.time = 0;
    this.hits = 0;
    this.input = IDLE_INPUT;
    this.bullets.clear();
    resetPlayer(this.player);
    for (const emitter of this.emitters) {
      resetEmitterRuntime(emitter);
    }
  }

  private resolvePlayerHit(): void {
    const { player } = this;
    if (isInvulnerable(player, this.time)) return;
    const hit = findBulletHit(this.bullets, player.x, player.y, player.config.hitboxRadius);
    if (hit === -1) return;
    this.bullets.kill(hit);
    this.hits++;
    player.invulnerableUntil = this.time + player.config.invulnerabilitySeconds;
  }
}
