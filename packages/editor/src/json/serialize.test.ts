import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createDefaultDraft } from '../state/patternReducer';
import { importPatternText, patternFileName, serializePattern } from './serialize';

const patternsDir = join(import.meta.dirname, '../../../../patterns');

describe('serializePattern', () => {
  it('writes keys in a stable, readable order', () => {
    const text = serializePattern({
      emitters: [{ sprite: 'ball-red', speed: 10, type: 'ring', bullets: 3, interval: 1 }],
      duration: 5,
      name: 'X',
      id: 'x',
      version: 1,
    });
    const keys = Object.keys(JSON.parse(text) as Record<string, unknown>);
    expect(keys).toEqual(['version', 'id', 'name', 'duration', 'emitters']);
    const emitterKeys = Object.keys(
      (JSON.parse(text) as { emitters: Record<string, unknown>[] }).emitters[0] ?? {},
    );
    expect(emitterKeys).toEqual(['type', 'interval', 'bullets', 'speed', 'sprite']);
  });

  it('does not expand defaults', () => {
    const text = serializePattern(createDefaultDraft());
    expect(text).not.toContain('"acceleration"');
    expect(text).not.toContain('"aimed"');
  });

  it('ends with a newline and uses two-space indentation', () => {
    const text = serializePattern(createDefaultDraft());
    expect(text.endsWith('}\n')).toBe(true);
    expect(text).toContain('\n  "id"');
  });
});

describe('importPatternText', () => {
  it('round-trips an exported draft', () => {
    const draft = createDefaultDraft();
    const result = importPatternText(serializePattern(draft));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft).toEqual(draft);
  });

  it('keeps the file as written instead of expanding defaults', () => {
    const result = importPatternText(
      '{"version":1,"id":"a","name":"A","duration":1,"emitters":[{"type":"ring","interval":1,"bullets":1,"speed":1}]}',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft.emitters[0]).not.toHaveProperty('aimed');
  });

  it('reports JSON syntax errors', () => {
    const result = importPatternText('{ nope');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^pattern: /);
  });

  it('reports schema errors with paths', () => {
    const result = importPatternText(
      '{"version":1,"id":"a","name":"A","duration":1,"emitters":[]}',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/^emitters: /);
  });

  it('round-trips every example pattern byte for byte', () => {
    for (const file of ['spiral-bloom.json', 'aimed-fan.json', 'twin-spiral.json']) {
      const text = readFileSync(join(patternsDir, file), 'utf8');
      const result = importPatternText(text);
      expect(result.ok, file).toBe(true);
      if (!result.ok) continue;
      expect(serializePattern(result.draft), file).toBe(text);
    }
  });
});

describe('patternFileName', () => {
  it('uses the pattern id', () => {
    expect(patternFileName({ ...createDefaultDraft(), id: 'spiral-bloom' })).toBe(
      'spiral-bloom.json',
    );
  });

  it('falls back when the id is empty', () => {
    expect(patternFileName({ ...createDefaultDraft(), id: '' })).toBe('pattern.json');
  });
});
