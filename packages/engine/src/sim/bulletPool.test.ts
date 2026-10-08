import { describe, expect, it } from 'vitest';

import { BulletPool } from './bulletPool';

const spawnAt = (pool: BulletPool, x: number, y: number): number =>
  pool.spawn(x, y, 0, 0, 0, 0, 1, 0);

describe('BulletPool', () => {
  it('rejects invalid capacities', () => {
    expect(() => new BulletPool(0)).toThrow(RangeError);
    expect(() => new BulletPool(1.5)).toThrow(RangeError);
  });

  it('spawns bullets into contiguous slots', () => {
    const pool = new BulletPool(4);
    expect(spawnAt(pool, 1, 2)).toBe(0);
    expect(spawnAt(pool, 3, 4)).toBe(1);
    expect(pool.count).toBe(2);
    expect(pool.x[1]).toBe(3);
    expect(pool.y[1]).toBe(4);
  });

  it('stores every property for a spawned bullet', () => {
    const pool = new BulletPool(1);
    const i = pool.spawn(10, 20, 30, 40, 50, 60, 3, 5);
    expect(i).toBe(0);
    expect(pool.x[i]).toBe(10);
    expect(pool.y[i]).toBe(20);
    expect(pool.vx[i]).toBe(30);
    expect(pool.vy[i]).toBe(40);
    expect(pool.ax[i]).toBe(50);
    expect(pool.ay[i]).toBe(60);
    expect(pool.radius[i]).toBe(3);
    expect(pool.sprite[i]).toBe(5);
  });

  it('returns -1 instead of throwing when full', () => {
    const pool = new BulletPool(2);
    spawnAt(pool, 0, 0);
    spawnAt(pool, 0, 0);
    expect(pool.isFull).toBe(true);
    expect(spawnAt(pool, 0, 0)).toBe(-1);
    expect(pool.count).toBe(2);
  });

  it('kills by swapping the last bullet into the freed slot', () => {
    const pool = new BulletPool(4);
    spawnAt(pool, 1, 0);
    spawnAt(pool, 2, 0);
    spawnAt(pool, 3, 0);
    pool.kill(0);
    expect(pool.count).toBe(2);
    expect(Array.from(pool.x.subarray(0, pool.count)).sort()).toEqual([2, 3]);
    expect(pool.x[0]).toBe(3);
  });

  it('ignores kills outside the live range', () => {
    const pool = new BulletPool(2);
    spawnAt(pool, 1, 0);
    pool.kill(5);
    pool.kill(-1);
    expect(pool.count).toBe(1);
  });

  it('reuses slots after a kill', () => {
    const pool = new BulletPool(1);
    spawnAt(pool, 1, 1);
    pool.kill(0);
    expect(spawnAt(pool, 2, 2)).toBe(0);
    expect(pool.x[0]).toBe(2);
  });

  it('clears all bullets', () => {
    const pool = new BulletPool(3);
    spawnAt(pool, 0, 0);
    spawnAt(pool, 0, 0);
    pool.clear();
    expect(pool.count).toBe(0);
  });

  it('integrates velocity and acceleration with semi-implicit Euler', () => {
    const pool = new BulletPool(1);
    pool.spawn(0, 0, 10, 0, 0, 100, 1, 0);
    pool.integrate(0.5);
    expect(pool.vy[0]).toBeCloseTo(50);
    expect(pool.x[0]).toBeCloseTo(5);
    expect(pool.y[0]).toBeCloseTo(25);
  });

  it('culls bullets outside the bounds and keeps the rest', () => {
    const pool = new BulletPool(5);
    spawnAt(pool, -1, 10);
    spawnAt(pool, 10, 10);
    spawnAt(pool, 10, 101);
    spawnAt(pool, 50, 50);
    spawnAt(pool, 101, 10);
    const killed = pool.cullOutside(0, 0, 100, 100);
    expect(killed).toBe(3);
    expect(pool.count).toBe(2);
    const survivors = Array.from(pool.x.subarray(0, pool.count)).sort((a, b) => a - b);
    expect(survivors).toEqual([10, 50]);
  });

  it('culls every bullet when all are out of bounds', () => {
    const pool = new BulletPool(3);
    spawnAt(pool, -5, -5);
    spawnAt(pool, -6, -6);
    spawnAt(pool, -7, -7);
    expect(pool.cullOutside(0, 0, 10, 10)).toBe(3);
    expect(pool.count).toBe(0);
  });
});
