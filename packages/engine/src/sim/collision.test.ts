import { describe, expect, it } from 'vitest';

import { BulletPool } from './bulletPool';
import { circlesOverlap, findBulletHit } from './collision';

describe('circlesOverlap', () => {
  it('detects overlapping circles', () => {
    expect(circlesOverlap(0, 0, 5, 3, 4, 1)).toBe(true);
  });

  it('treats touching circles as not overlapping', () => {
    expect(circlesOverlap(0, 0, 3, 5, 0, 2)).toBe(false);
  });

  it('detects separated circles', () => {
    expect(circlesOverlap(0, 0, 1, 10, 10, 1)).toBe(false);
  });
});

describe('findBulletHit', () => {
  it('returns -1 when no bullet overlaps', () => {
    const pool = new BulletPool(4);
    pool.spawn(100, 100, 0, 0, 0, 0, 4, 0);
    expect(findBulletHit(pool, 0, 0, 2.5)).toBe(-1);
  });

  it('returns the slot of the overlapping bullet', () => {
    const pool = new BulletPool(4);
    pool.spawn(100, 100, 0, 0, 0, 0, 4, 0);
    pool.spawn(10, 10, 0, 0, 0, 0, 4, 0);
    expect(findBulletHit(pool, 12, 10, 2.5)).toBe(1);
  });

  it('uses the bullet radius from the pool', () => {
    const pool = new BulletPool(4);
    pool.spawn(0, 0, 0, 0, 0, 0, 1, 0);
    expect(findBulletHit(pool, 5, 0, 2.5)).toBe(-1);
    pool.radius[0] = 3;
    expect(findBulletHit(pool, 5, 0, 2.5)).toBe(0);
  });
});
