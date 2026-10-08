import { describe, expect, it } from 'vitest';

import { ringAngle, spiralAngle, spreadAngle, spunAngle } from './emitterMath';

describe('ringAngle', () => {
  it('spaces bullets evenly around 360 degrees', () => {
    expect(ringAngle(0, 4, 0)).toBe(0);
    expect(ringAngle(1, 4, 0)).toBe(90);
    expect(ringAngle(3, 4, 0)).toBe(270);
  });

  it('offsets every bullet by the base angle', () => {
    expect(ringAngle(1, 4, 10)).toBe(100);
  });
});

describe('spreadAngle', () => {
  it('puts a single bullet on the centre', () => {
    expect(spreadAngle(0, 1, 60, 90)).toBe(90);
  });

  it('spans the full fan from edge to edge', () => {
    expect(spreadAngle(0, 3, 60, 90)).toBe(60);
    expect(spreadAngle(1, 3, 60, 90)).toBe(90);
    expect(spreadAngle(2, 3, 60, 90)).toBe(120);
  });

  it('collapses to the centre when the spread is zero', () => {
    expect(spreadAngle(0, 5, 0, 45)).toBe(45);
    expect(spreadAngle(4, 5, 0, 45)).toBe(45);
  });
});

describe('spiralAngle', () => {
  it('spaces streams like a ring', () => {
    expect(spiralAngle(1, 2, 30)).toBe(210);
  });
});

describe('spunAngle', () => {
  it('adds spin times elapsed seconds', () => {
    expect(spunAngle(10, 90, 2)).toBe(190);
    expect(spunAngle(10, -45, 1)).toBe(-35);
    expect(spunAngle(10, 0, 100)).toBe(10);
  });
});
