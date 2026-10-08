import { describe, expect, it } from 'vitest';

import { formatIssuePath, parsePattern, parsePatternJson } from './parse';

const validPattern = {
  version: 1,
  id: 'spiral-bloom',
  name: 'Spiral Bloom',
  duration: 10,
  emitters: [{ type: 'ring', interval: 0.2, bullets: 24, speed: 120, spin: 15 }],
};

describe('parsePattern', () => {
  it('accepts a valid pattern and applies defaults', () => {
    const result = parsePattern(validPattern);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [emitter] = result.pattern.emitters;
    expect(emitter).toMatchObject({
      start: 0,
      acceleration: 0,
      angle: 0,
      aimed: false,
      sprite: 'rice-red',
      x: 192,
      y: 112,
    });
    expect(result.pattern.seed).toBe(0);
  });

  it('narrows emitter fields by type', () => {
    const result = parsePattern({
      ...validPattern,
      emitters: [
        { type: 'spread', interval: 1, bullets: 5, spread: 60, speed: 100, aimed: true },
        { type: 'spiral', interval: 0.05, streams: 3, spin: 90, speed: 80 },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [spread, spiral] = result.pattern.emitters;
    expect(spread?.type).toBe('spread');
    expect(spiral?.type === 'spiral' && spiral.streams).toBe(3);
  });

  it('rejects non-object input with a readable message', () => {
    const result = parsePattern('nope');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^pattern: /);
  });

  it('reports the path of each invalid field', () => {
    const result = parsePattern({
      ...validPattern,
      id: 'Not Kebab',
      emitters: [{ type: 'ring', interval: 0, bullets: 0, speed: -1 }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^id: must be kebab-case/),
        expect.stringMatching(/^emitters\[0\]\.interval: /),
        expect.stringMatching(/^emitters\[0\]\.bullets: /),
        expect.stringMatching(/^emitters\[0\]\.speed: /),
      ]),
    );
  });

  it('rejects unknown emitter types', () => {
    const result = parsePattern({ ...validPattern, emitters: [{ type: 'laser', interval: 1 }] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^emitters\[0\]\.type: /);
  });

  it('rejects unknown sprite keys', () => {
    const result = parsePattern({
      ...validPattern,
      emitters: [{ type: 'ring', interval: 1, bullets: 4, speed: 10, sprite: 'laser-pink' }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^emitters\[0\]\.sprite: /);
  });

  it('rejects emitters that start after the pattern ends', () => {
    const result = parsePattern({
      ...validPattern,
      duration: 5,
      emitters: [{ type: 'ring', interval: 1, bullets: 4, speed: 10, start: 5 }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain(
      'emitters[0].start: must be lower than the pattern duration (5s)',
    );
  });

  it('rejects an unsupported version', () => {
    const result = parsePattern({ ...validPattern, version: 2 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^version: /);
  });
});

describe('parsePatternJson', () => {
  it('parses valid JSON text', () => {
    expect(parsePatternJson(JSON.stringify(validPattern)).ok).toBe(true);
  });

  it('reports JSON syntax errors without throwing', () => {
    const result = parsePatternJson('{ "version": 1, ');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/^pattern: /);
  });
});

describe('formatIssuePath', () => {
  it('formats nested paths with array indices', () => {
    expect(formatIssuePath([])).toBe('pattern');
    expect(formatIssuePath(['emitters'])).toBe('emitters');
    expect(formatIssuePath(['emitters', 2, 'speed'])).toBe('emitters[2].speed');
  });
});
