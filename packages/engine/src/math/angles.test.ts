import { describe, expect, it } from 'vitest';

import { angleBetween, degToRad, normalizeDegrees, radToDeg } from './angles';

describe('angles', () => {
  it('converts degrees to radians and back', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
    expect(radToDeg(degToRad(123.4))).toBeCloseTo(123.4);
  });

  it('normalizes degrees into [0, 360)', () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(370)).toBe(10);
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(-720)).toBe(0);
  });

  it('follows the canvas convention: 0 is right, 90 is down', () => {
    expect(angleBetween(0, 0, 10, 0)).toBeCloseTo(0);
    expect(angleBetween(0, 0, 0, 10)).toBeCloseTo(90);
    expect(angleBetween(0, 0, -10, 0)).toBeCloseTo(180);
    expect(angleBetween(0, 0, 0, -10)).toBeCloseTo(-90);
  });

  it('measures the angle from the first point to the second', () => {
    expect(angleBetween(100, 100, 110, 110)).toBeCloseTo(45);
    expect(angleBetween(110, 110, 100, 100)).toBeCloseTo(-135);
  });
});
