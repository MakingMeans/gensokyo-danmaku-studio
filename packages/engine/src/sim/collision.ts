import type { BulletPool } from './bulletPool';

/** Circle versus circle test using squared distances to avoid a square root. */
export function circlesOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const reach = r1 + r2;
  return dx * dx + dy * dy < reach * reach;
}

/**
 * Returns the slot of the first live bullet overlapping the circle, or -1.
 * One hit per tick is enough: the player becomes invulnerable afterwards.
 */
export function findBulletHit(pool: BulletPool, x: number, y: number, radius: number): number {
  const { x: bx, y: by, radius: br, count } = pool;
  for (let i = 0; i < count; i++) {
    const dx = bx[i] - x;
    const dy = by[i] - y;
    const reach = br[i] + radius;
    if (dx * dx + dy * dy < reach * reach) return i;
  }
  return -1;
}
