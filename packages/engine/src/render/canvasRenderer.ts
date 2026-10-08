import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';
import { isInvulnerable } from '../sim/player';
import type { Simulation } from '../sim/simulation';
import { drawHitbox } from './placeholders';
import type { AtlasEntry, SpriteAtlas } from './spriteAtlas';

export interface CanvasRendererOptions {
  readonly background?: string;
  /** Seconds per blink cycle while the player is invulnerable. */
  readonly blinkPeriod?: number;
}

/**
 * Paints the simulation state onto a canvas. The playfield keeps its internal
 * 384x448 resolution and is scaled by an integer factor so pixel art stays crisp.
 */
export class CanvasRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly atlas: SpriteAtlas;
  private readonly background: string;
  private readonly blinkPeriod: number;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement, atlas: SpriteAtlas, options: CanvasRendererOptions = {}) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not create a 2D canvas context');
    this.canvas = canvas;
    this.ctx = ctx;
    this.atlas = atlas;
    this.background = options.background ?? '#0b0b14';
    this.blinkPeriod = options.blinkPeriod ?? 0.12;
    this.resize(canvas.width, canvas.height);
  }

  /** Current integer scale factor between playfield pixels and canvas pixels. */
  get scaleFactor(): number {
    return this.scale;
  }

  /**
   * Fits the playfield into the available size using the largest integer scale
   * that fits, falling back to 1 on tiny screens.
   */
  resize(availableWidth: number, availableHeight: number): void {
    const fit = Math.min(availableWidth / PLAYFIELD_WIDTH, availableHeight / PLAYFIELD_HEIGHT);
    this.scale = Math.max(1, Math.floor(fit));
    this.canvas.width = PLAYFIELD_WIDTH * this.scale;
    this.canvas.height = PLAYFIELD_HEIGHT * this.scale;
    // Setting width/height resets context state, so smoothing must be disabled again.
    this.ctx.imageSmoothingEnabled = false;
  }

  render(sim: Simulation): void {
    const { ctx, scale } = this;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);

    this.drawBullets(sim);
    this.drawPlayer(sim);
  }

  private drawBullets(sim: Simulation): void {
    const { ctx, atlas } = this;
    const { x, y, vx, vy, sprite, count } = sim.bullets;
    const twoPi = Math.PI * 2;

    for (let i = 0; i < count; i++) {
      const entry = atlas.bullets[sprite[i]];
      if (!entry) continue;
      let frame = 0;
      if (entry.rotations > 1) {
        const angle = Math.atan2(vy[i], vx[i]);
        frame = Math.round((((angle + twoPi) % twoPi) / twoPi) * entry.rotations) % entry.rotations;
      }
      drawFrame(ctx, entry, frame, x[i], y[i]);
    }
  }

  private drawPlayer(sim: Simulation): void {
    const { ctx, atlas } = this;
    const { player, time } = sim;

    const blinking = isInvulnerable(player, time);
    const visible = !blinking || Math.floor(time / this.blinkPeriod) % 2 === 0;
    if (visible) {
      drawFrame(ctx, atlas.player, 0, player.x, player.y);
    }
    if (player.focus) {
      drawHitbox(ctx, player.x, player.y, player.config.hitboxRadius);
    }
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  entry: AtlasEntry,
  frame: number,
  x: number,
  y: number,
): void {
  const { size } = entry;
  const half = size / 2;
  // Snap to whole pixels so sprites never straddle a pixel boundary after scaling.
  const dx = Math.round(x - half);
  const dy = Math.round(y - half);
  ctx.drawImage(entry.sheet, frame * size, entry.rowY, size, size, dx, dy, size, size);
}
