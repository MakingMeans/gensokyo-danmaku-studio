import { describe, expect, it } from 'vitest';

import { createRng } from './rng';

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('keeps next() within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('keeps range() within [min, max)', () => {
    const rng = createRng(3);
    for (let i = 0; i < 1_000; i++) {
      const value = rng.range(-10, 10);
      expect(value).toBeGreaterThanOrEqual(-10);
      expect(value).toBeLessThan(10);
    }
  });

  it('keeps int() within [min, max] and hits both ends', () => {
    const rng = createRng(11);
    const seen = new Set<number>();
    for (let i = 0; i < 1_000; i++) {
      const value = rng.int(1, 6);
      expect(Number.isInteger(value)).toBe(true);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('is roughly uniform', () => {
    const rng = createRng(99);
    const buckets = new Array<number>(10).fill(0);
    const samples = 100_000;
    for (let i = 0; i < samples; i++) {
      buckets[Math.floor(rng.next() * 10)] += 1;
    }
    for (const count of buckets) {
      expect(count / samples).toBeCloseTo(0.1, 1);
    }
  });
});
