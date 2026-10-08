import { describe, expect, it } from 'vitest';

import { FIXED_DT, FIXED_UPDATES_PER_SECOND, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from './constants';

describe('constants', () => {
  it('uses classic Touhou playfield proportions', () => {
    expect(PLAYFIELD_WIDTH / PLAYFIELD_HEIGHT).toBeCloseTo(384 / 448);
  });

  it('derives the fixed timestep from the update rate', () => {
    expect(FIXED_DT * FIXED_UPDATES_PER_SECOND).toBeCloseTo(1);
  });
});
