/**
 * Fixed-capacity bullet pool laid out as a struct of arrays.
 *
 * Every property lives in its own typed array, indexed by bullet slot. Live
 * bullets always occupy slots [0, count), so iterating is a tight loop over
 * contiguous memory with no per-bullet objects and no allocations per frame.
 *
 * Killing a bullet swaps it with the last live one and shrinks `count`, which
 * keeps the live range contiguous at the cost of not preserving order. Order
 * does not matter for danmaku, so this is the right trade.
 */
export class BulletPool {
  readonly capacity: number;

  /** Number of live bullets. Live bullets occupy slots [0, count). */
  count = 0;

  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly ax: Float32Array;
  readonly ay: Float32Array;
  readonly radius: Float32Array;
  /** Index into the sprite catalogue. */
  readonly sprite: Uint8Array;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new RangeError(`BulletPool capacity must be a positive integer, got ${capacity}`);
    }
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.ax = new Float32Array(capacity);
    this.ay = new Float32Array(capacity);
    this.radius = new Float32Array(capacity);
    this.sprite = new Uint8Array(capacity);
  }

  get isFull(): boolean {
    return this.count >= this.capacity;
  }

  /**
   * Spawns a bullet and returns its slot, or -1 when the pool is full.
   * A full pool silently drops bullets rather than throwing: a frame with a few
   * missing bullets is better than a crash mid-fight.
   */
  spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    ax: number,
    ay: number,
    radius: number,
    sprite: number,
  ): number {
    if (this.count >= this.capacity) return -1;
    const i = this.count++;
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.ax[i] = ax;
    this.ay[i] = ay;
    this.radius[i] = radius;
    this.sprite[i] = sprite;
    return i;
  }

  /** Kills the bullet in slot `i` by swapping the last live bullet into it. */
  kill(i: number): void {
    if (i < 0 || i >= this.count) return;
    const last = this.count - 1;
    if (i !== last) {
      this.x[i] = this.x[last];
      this.y[i] = this.y[last];
      this.vx[i] = this.vx[last];
      this.vy[i] = this.vy[last];
      this.ax[i] = this.ax[last];
      this.ay[i] = this.ay[last];
      this.radius[i] = this.radius[last];
      this.sprite[i] = this.sprite[last];
    }
    this.count = last;
  }

  clear(): void {
    this.count = 0;
  }

  /** Advances every live bullet by `dt` seconds using semi-implicit Euler. */
  integrate(dt: number): void {
    const { x, y, vx, vy, ax, ay, count } = this;
    for (let i = 0; i < count; i++) {
      vx[i] += ax[i] * dt;
      vy[i] += ay[i] * dt;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }
  }

  /**
   * Kills every bullet whose centre lies outside the given bounds.
   * Iterates backwards so the swap performed by `kill` never skips a bullet.
   */
  cullOutside(minX: number, minY: number, maxX: number, maxY: number): number {
    const { x, y } = this;
    let killed = 0;
    for (let i = this.count - 1; i >= 0; i--) {
      const bx = x[i];
      const by = y[i];
      if (bx < minX || bx > maxX || by < minY || by > maxY) {
        this.kill(i);
        killed++;
      }
    }
    return killed;
  }
}
