import { parsePattern } from '@gds/engine';
import { describe, expect, it } from 'vitest';

import {
  createDefaultDraft,
  createDefaultEmitter,
  createInitialState,
  patternReducer,
  type EditorState,
} from './patternReducer';

function state(): EditorState {
  return createInitialState();
}

describe('defaults', () => {
  it('produces a valid draft', () => {
    expect(parsePattern(createDefaultDraft()).ok).toBe(true);
  });

  it.each(['ring', 'spread', 'spiral'] as const)('produces a valid %s emitter', (type) => {
    const draft = { ...createDefaultDraft(), emitters: [createDefaultEmitter(type)] };
    const result = parsePattern(draft);
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
  });
});

describe('patternReducer', () => {
  it('sets metadata fields', () => {
    const next = patternReducer(state(), { type: 'setMeta', field: 'name', value: 'Bloom' });
    expect(next.draft.name).toBe('Bloom');
    expect(
      patternReducer(next, { type: 'setMeta', field: 'duration', value: 7 }).draft.duration,
    ).toBe(7);
  });

  it('adds an emitter and selects it', () => {
    const next = patternReducer(state(), { type: 'addEmitter', emitterType: 'spiral' });
    expect(next.draft.emitters).toHaveLength(2);
    expect(next.draft.emitters[1]?.type).toBe('spiral');
    expect(next.selected).toBe(1);
  });

  it('never removes the last emitter', () => {
    const next = patternReducer(state(), { type: 'removeEmitter', index: 0 });
    expect(next.draft.emitters).toHaveLength(1);
  });

  it('removes an emitter and keeps a valid selection', () => {
    let s = patternReducer(state(), { type: 'addEmitter' });
    s = patternReducer(s, { type: 'addEmitter' });
    s = patternReducer(s, { type: 'select', index: 2 });
    s = patternReducer(s, { type: 'removeEmitter', index: 2 });
    expect(s.draft.emitters).toHaveLength(2);
    expect(s.selected).toBe(1);
    s = patternReducer(s, { type: 'select', index: 1 });
    s = patternReducer(s, { type: 'removeEmitter', index: 0 });
    expect(s.selected).toBe(0);
  });

  it('duplicates an emitter right after the original', () => {
    let s = patternReducer(state(), { type: 'addEmitter', emitterType: 'spread' });
    s = patternReducer(s, { type: 'duplicateEmitter', index: 0 });
    expect(s.draft.emitters.map((e) => e.type)).toEqual(['ring', 'ring', 'spread']);
    expect(s.draft.emitters[1]).toEqual(s.draft.emitters[0]);
    expect(s.draft.emitters[1]).not.toBe(s.draft.emitters[0]);
    expect(s.selected).toBe(1);
  });

  it('moves emitters and follows the selection', () => {
    let s = patternReducer(state(), { type: 'addEmitter', emitterType: 'spread' });
    s = patternReducer(s, { type: 'addEmitter', emitterType: 'spiral' });
    s = patternReducer(s, { type: 'select', index: 0 });
    s = patternReducer(s, { type: 'moveEmitter', index: 0, direction: 1 });
    expect(s.draft.emitters.map((e) => e.type)).toEqual(['spread', 'ring', 'spiral']);
    expect(s.selected).toBe(1);
    expect(patternReducer(s, { type: 'moveEmitter', index: 2, direction: 1 })).toBe(s);
    expect(patternReducer(s, { type: 'moveEmitter', index: 0, direction: -1 })).toBe(s);
  });

  it('updates a field of an emitter without touching the others', () => {
    let s = patternReducer(state(), { type: 'addEmitter' });
    s = patternReducer(s, { type: 'updateEmitter', index: 1, field: 'speed', value: 300 });
    expect(s.draft.emitters[1]?.speed).toBe(300);
    expect(s.draft.emitters[0]?.speed).toBe(120);
  });

  it('removes a field when the value is undefined', () => {
    let s = patternReducer(state(), { type: 'updateEmitter', index: 0, field: 'count', value: 5 });
    expect(s.draft.emitters[0]).toHaveProperty('count', 5);
    s = patternReducer(s, { type: 'updateEmitter', index: 0, field: 'count', value: undefined });
    expect(s.draft.emitters[0]).not.toHaveProperty('count');
  });

  it('ignores updates to a missing emitter', () => {
    const s = state();
    expect(patternReducer(s, { type: 'updateEmitter', index: 9, field: 'speed', value: 1 })).toBe(
      s,
    );
  });

  it('changes the emitter type keeping shared fields and dropping specific ones', () => {
    let s = patternReducer(state(), { type: 'updateEmitter', index: 0, field: 'speed', value: 77 });
    s = patternReducer(s, { type: 'updateEmitter', index: 0, field: 'bullets', value: 9 });
    s = patternReducer(s, { type: 'setEmitterType', index: 0, emitterType: 'spread' });
    const spread = s.draft.emitters[0];
    expect(spread?.type).toBe('spread');
    expect(spread?.speed).toBe(77);
    expect(spread).toHaveProperty('bullets', 9);
    expect(spread).toHaveProperty('spread', 45);

    s = patternReducer(s, { type: 'setEmitterType', index: 0, emitterType: 'spiral' });
    const spiral = s.draft.emitters[0];
    expect(spiral?.type).toBe('spiral');
    expect(spiral?.speed).toBe(77);
    expect(spiral).not.toHaveProperty('bullets');
    expect(spiral).not.toHaveProperty('spread');
    expect(spiral).toHaveProperty('streams', 2);
    expect(parsePattern(s.draft).ok).toBe(true);
  });

  it('returns the same emitter when the type does not change', () => {
    const s = state();
    const next = patternReducer(s, { type: 'setEmitterType', index: 0, emitterType: 'ring' });
    expect(next.draft.emitters[0]).toBe(s.draft.emitters[0]);
  });

  it('loads a draft and resets the selection', () => {
    let s = patternReducer(state(), { type: 'addEmitter' });
    s = patternReducer(s, { type: 'select', index: 1 });
    const draft = { ...createDefaultDraft(), id: 'loaded' };
    s = patternReducer(s, { type: 'load', draft });
    expect(s.draft.id).toBe('loaded');
    expect(s.selected).toBe(0);
  });

  it('resets to the default draft', () => {
    let s = patternReducer(state(), { type: 'setMeta', field: 'id', value: 'changed' });
    s = patternReducer(s, { type: 'reset' });
    expect(s.draft).toEqual(createDefaultDraft());
  });
});
