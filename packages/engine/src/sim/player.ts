import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';

/** Normalised movement intent for one tick. Axes are in [-1, 1]. */
export interface PlayerInput {
  readonly dx: number;
  readonly dy: number;
  readonly focus: boolean;
}

export const IDLE_INPUT: PlayerInput = { dx: 0, dy: 0, focus: false };

export interface PlayerConfig {
  /** Movement speed in pixels per second. */
  readonly speed: number;
  /** Movement speed in pixels per second while focused. */
  readonly focusSpeed: number;
  /** Collision radius in pixels. Tiny on purpose, as in the genre. */
  readonly hitboxRadius: number;
  /** Seconds of invulnerability after taking a hit. */
  readonly invulnerabilitySeconds: number;
  /** Distance from the playfield edge the player cannot cross. */
  readonly margin: number;
}

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  speed: 220,
  focusSpeed: 100,
  hitboxRadius: 2.5,
  invulnerabilitySeconds: 2,
  margin: 8,
};

export interface PlayerState {
  x: number;
  y: number;
  focus: boolean;
  /** Simulation time until which hits are ignored. */
  invulnerableUntil: number;
  readonly config: PlayerConfig;
}

export function createPlayer(config: PlayerConfig = DEFAULT_PLAYER_CONFIG): PlayerState {
  return {
    x: PLAYFIELD_WIDTH / 2,
    y: PLAYFIELD_HEIGHT - 48,
    focus: false,
    invulnerableUntil: 0,
    config,
  };
}

export function resetPlayer(player: PlayerState): void {
  player.x = PLAYFIELD_WIDTH / 2;
  player.y = PLAYFIELD_HEIGHT - 48;
  player.focus = false;
  player.invulnerableUntil = 0;
}

/** Moves the player for one tick, normalising diagonals and clamping to the playfield. */
export function updatePlayer(player: PlayerState, input: PlayerInput, dt: number): void {
  const { config } = player;
  player.focus = input.focus;

  let dx = input.dx;
  let dy = input.dy;
  const length = Math.hypot(dx, dy);
  if (length > 1) {
    dx /= length;
    dy /= length;
  }

  const speed = input.focus ? config.focusSpeed : config.speed;
  player.x = clamp(player.x + dx * speed * dt, config.margin, PLAYFIELD_WIDTH - config.margin);
  player.y = clamp(player.y + dy * speed * dt, config.margin, PLAYFIELD_HEIGHT - config.margin);
}

export function isInvulnerable(player: PlayerState, time: number): boolean {
  return time < player.invulnerableUntil;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
