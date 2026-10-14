import { parsePattern, type EmitterType } from '@gds/engine';
import { describe, expect, it } from 'vitest';

import {
  COMMON_FIELDS,
  COUNT_FIELD,
  DURATION_FIELD,
  EMITTER_TYPES,
  SEED_FIELD,
  TYPE_FIELDS,
  type FieldSpec,
} from './fieldSpecs';
import { createDefaultDraft, createDefaultEmitter } from './patternReducer';

function patternWithEmitterField(type: EmitterType, key: string, value: number) {
  return {
    ...createDefaultDraft(),
    duration: 60,
    emitters: [{ ...createDefaultEmitter(type), [key]: value }],
  };
}

function emitterCases(): [EmitterType, FieldSpec][] {
  return EMITTER_TYPES.flatMap((type) =>
    [...COMMON_FIELDS, COUNT_FIELD, ...TYPE_FIELDS[type]].map((spec): [EmitterType, FieldSpec] => [
      type,
      spec,
    ]),
  );
}

describe('emitter field specs', () => {
  it.each(emitterCases())('%s.%s accepts its min and max', (type, spec) => {
    for (const value of [spec.min, spec.max]) {
      const result = parsePattern(patternWithEmitterField(type, spec.key, value));
      expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
    }
  });

  it.each(emitterCases().filter(([, spec]) => spec.hard))(
    '%s.%s hard bounds match the schema',
    (type, spec) => {
      expect(parsePattern(patternWithEmitterField(type, spec.key, spec.min - spec.step)).ok).toBe(
        false,
      );
      expect(parsePattern(patternWithEmitterField(type, spec.key, spec.max + spec.step)).ok).toBe(
        false,
      );
    },
  );

  it('uses steps that land exactly on the bounds', () => {
    for (const [, spec] of emitterCases()) {
      const steps = (spec.max - spec.min) / spec.step;
      expect(Math.abs(steps - Math.round(steps)), spec.key).toBeLessThan(1e-9);
    }
  });

  it.each(EMITTER_TYPES)('%s fallbacks match the schema defaults', (type) => {
    const minimal: Record<string, unknown> = { type, interval: 1, speed: 1 };
    if (type !== 'spiral') minimal.bullets = 1;
    if (type === 'spread') minimal.spread = 10;
    const result = parsePattern({ ...createDefaultDraft(), emitters: [minimal] });
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
    if (!result.ok) return;
    const parsed = result.pattern.emitters[0] as unknown as Record<string, unknown>;
    for (const spec of [...COMMON_FIELDS, ...TYPE_FIELDS[type]]) {
      if (spec.fallback === undefined) continue;
      expect(parsed[spec.key], spec.key).toBe(spec.fallback);
    }
  });
});

describe('pattern field specs', () => {
  it('accepts duration and seed bounds', () => {
    for (const spec of [DURATION_FIELD, SEED_FIELD]) {
      for (const value of [spec.min, spec.max]) {
        const result = parsePattern({ ...createDefaultDraft(), [spec.key]: value });
        expect(result.ok, `${spec.key}=${value}`).toBe(true);
      }
    }
  });

  it('seed fallback matches the schema default', () => {
    const result = parsePattern(createDefaultDraft());
    expect(result.ok && result.pattern.seed).toBe(SEED_FIELD.fallback);
  });
});
