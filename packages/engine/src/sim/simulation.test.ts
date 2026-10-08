import { describe, expect, it } from 'vitest';

import { FIXED_DT, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';
import { parsePattern } from '../pattern/parse';
import type { Pattern } from '../pattern/schema';
import { Simulation } from './simulation';

function pattern(overrides: Record<string, unknown> = {}): Pattern {
  const result = parsePattern({
    version: 1,
    id: 'test',
    name: 'Test',
    duration: 2,
    emitters: [{ type: 'ring', interval: 0.5, bullets: 8, speed: 100 }],
    ...overrides,
  });
  if (!result.ok) throw new Error(result.errors.join('\n'));
  return result.pattern;
}

function run(sim: Simulation, seconds: number): void {
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps; i++) sim.step(FIXED_DT);
}

/** Snapshot of the live bullet state for determinism checks. */
function snapshot(sim: Simulation): number[] {
  const { bullets } = sim;
  return [
    ...bullets.x.subarray(0, bullets.count),
    ...bullets.y.subarray(0, bullets.count),
    sim.player.x,
    sim.player.y,
    sim.hits,
  ];
}

describe('Simulation', () => {
  it('fires emitters and advances time', () => {
    const sim = new Simulation({ pattern: pattern() });
    sim.step(FIXED_DT);
    expect(sim.time).toBeCloseTo(FIXED_DT);
    expect(sim.bullets.count).toBe(8);
  });

  it('moves bullets every step', () => {
    const sim = new Simulation({ pattern: pattern() });
    sim.step(FIXED_DT);
    const before = sim.bullets.x[0];
    sim.step(FIXED_DT);
    expect(sim.bullets.x[0]).not.toBe(before);
  });

  it('stops firing once the pattern duration elapses', () => {
    const sim = new Simulation({ pattern: pattern({ duration: 1 }) });
    run(sim, 1);
    expect(sim.patternEnded).toBe(true);
    const count = sim.bullets.count;
    run(sim, 0.2);
    expect(sim.bullets.count).toBeLessThanOrEqual(count);
  });

  it('culls bullets that leave the playfield and eventually finishes', () => {
    const sim = new Simulation({ pattern: pattern({ duration: 0.5 }) });
    run(sim, 10);
    expect(sim.bullets.count).toBe(0);
    expect(sim.finished).toBe(true);
  });

  it('is deterministic for the same pattern and input', () => {
    const a = new Simulation({ pattern: pattern() });
    const b = new Simulation({ pattern: pattern() });
    const input = { dx: -1, dy: 0, focus: true };
    a.setPlayerInput(input);
    b.setPlayerInput(input);
    run(a, 1.5);
    run(b, 1.5);
    expect(snapshot(a)).toEqual(snapshot(b));
  });

  it('moves the player from input', () => {
    const sim = new Simulation({ pattern: pattern() });
    const startX = sim.player.x;
    sim.setPlayerInput({ dx: 1, dy: 0, focus: false });
    run(sim, 0.5);
    expect(sim.player.x).toBeGreaterThan(startX);
  });

  it('registers a hit, removes the bullet and grants invulnerability', () => {
    // A single aimed bullet fired straight at a player who does not move.
    const sim = new Simulation({
      pattern: pattern({
        duration: 5,
        emitters: [
          { type: 'spread', interval: 10, bullets: 1, spread: 0, speed: 200, aimed: true },
        ],
      }),
    });
    run(sim, 3);
    expect(sim.hits).toBe(1);
    expect(sim.bullets.count).toBe(0);
    expect(sim.player.invulnerableUntil).toBeGreaterThan(sim.time - 2);
  });

  it('ignores hits while invulnerable', () => {
    const sim = new Simulation({
      pattern: pattern({
        duration: 5,
        emitters: [
          { type: 'spread', interval: 0.05, bullets: 1, spread: 0, speed: 300, aimed: true },
        ],
      }),
    });
    run(sim, 1.5);
    expect(sim.hits).toBe(1);
  });

  it('resets to the initial state', () => {
    const sim = new Simulation({ pattern: pattern() });
    sim.setPlayerInput({ dx: 1, dy: -1, focus: true });
    run(sim, 1);
    sim.reset();
    expect(sim.time).toBe(0);
    expect(sim.hits).toBe(0);
    expect(sim.bullets.count).toBe(0);
    expect(sim.player.x).toBe(PLAYFIELD_WIDTH / 2);
    expect(sim.player.y).toBe(PLAYFIELD_HEIGHT - 48);
    sim.step(FIXED_DT);
    expect(sim.bullets.count).toBe(8);
  });

  it('respects the configured bullet capacity', () => {
    const sim = new Simulation({ pattern: pattern(), capacity: 5 });
    sim.step(FIXED_DT);
    expect(sim.bullets.count).toBe(5);
  });

  it('seeds the RNG from the pattern', () => {
    const sim = new Simulation({ pattern: pattern({ seed: 1234 }) });
    expect(sim.rng.seed).toBe(1234);
  });
});
