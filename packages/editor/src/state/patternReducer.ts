import {
  PATTERN_VERSION,
  type EmitterInput,
  type EmitterType,
  type PatternInput,
} from '@gds/engine';

/**
 * The editor works on the loose input shape of a pattern, exactly what a JSON
 * file contains before defaults are applied. Validation happens separately
 * through `parsePattern`, so the draft may be temporarily invalid while the
 * user types.
 */
export type PatternDraft = PatternInput;
export type EmitterDraft = EmitterInput;

export interface EditorState {
  readonly draft: PatternDraft;
  /** Index of the emitter being edited. */
  readonly selected: number;
}

export type EmitterFieldValue = number | string | boolean | undefined;

export type EditorAction =
  | { type: 'load'; draft: PatternDraft }
  | { type: 'reset' }
  | { type: 'setMeta'; field: 'id' | 'name' | 'duration' | 'seed'; value: string | number }
  | { type: 'select'; index: number }
  | { type: 'addEmitter'; emitterType?: EmitterType }
  | { type: 'removeEmitter'; index: number }
  | { type: 'duplicateEmitter'; index: number }
  | { type: 'moveEmitter'; index: number; direction: -1 | 1 }
  | { type: 'updateEmitter'; index: number; field: string; value: EmitterFieldValue }
  | { type: 'setEmitterType'; index: number; emitterType: EmitterType };

/** Starting values for a new emitter of each type, tuned to look good immediately. */
export function createDefaultEmitter(type: EmitterType = 'ring'): EmitterDraft {
  switch (type) {
    case 'ring':
      return { type, interval: 0.2, bullets: 24, speed: 120, spin: 15, sprite: 'rice-red' };
    case 'spread':
      return {
        type,
        interval: 0.6,
        bullets: 5,
        spread: 45,
        speed: 150,
        aimed: true,
        sprite: 'ball-red',
      };
    case 'spiral':
      return { type, interval: 0.05, streams: 2, spin: 90, speed: 120, sprite: 'rice-blue' };
  }
}

export function createDefaultDraft(): PatternDraft {
  return {
    version: PATTERN_VERSION,
    id: 'new-pattern',
    name: 'New Pattern',
    duration: 10,
    emitters: [createDefaultEmitter('ring')],
  };
}

export function createInitialState(draft: PatternDraft = createDefaultDraft()): EditorState {
  return { draft, selected: 0 };
}

/** Fields shared by every emitter type; kept when the type changes. */
const COMMON_KEYS = new Set([
  'start',
  'interval',
  'count',
  'x',
  'y',
  'speed',
  'acceleration',
  'angle',
  'spin',
  'aimed',
  'sprite',
]);

function convertEmitterType(emitter: EmitterDraft, emitterType: EmitterType): EmitterDraft {
  if (emitter.type === emitterType) return emitter;
  const defaults = createDefaultEmitter(emitterType);
  const kept: Record<string, EmitterFieldValue> = {};
  for (const [key, value] of Object.entries(emitter)) {
    if (COMMON_KEYS.has(key)) kept[key] = value;
  }
  // `bullets` means the same thing for ring and spread, so carry it over too.
  if ('bullets' in emitter && 'bullets' in defaults) kept.bullets = emitter.bullets;
  return { ...defaults, ...kept, type: emitterType } as EmitterDraft;
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

function withEmitters(state: EditorState, emitters: EmitterDraft[], selected: number): EditorState {
  return { draft: { ...state.draft, emitters }, selected: clampIndex(selected, emitters.length) };
}

export function patternReducer(state: EditorState, action: EditorAction): EditorState {
  const { emitters } = state.draft;

  switch (action.type) {
    case 'load':
      return createInitialState(action.draft);

    case 'reset':
      return createInitialState();

    case 'setMeta':
      return { ...state, draft: { ...state.draft, [action.field]: action.value } };

    case 'select':
      return { ...state, selected: clampIndex(action.index, emitters.length) };

    case 'addEmitter': {
      const next = [...emitters, createDefaultEmitter(action.emitterType)];
      return withEmitters(state, next, next.length - 1);
    }

    case 'removeEmitter': {
      if (emitters.length <= 1) return state;
      const next = emitters.filter((_, i) => i !== action.index);
      const selected = state.selected > action.index ? state.selected - 1 : state.selected;
      return withEmitters(state, next, selected);
    }

    case 'duplicateEmitter': {
      const source = emitters[action.index];
      if (!source) return state;
      const next = [...emitters];
      next.splice(action.index + 1, 0, { ...source });
      return withEmitters(state, next, action.index + 1);
    }

    case 'moveEmitter': {
      const from = action.index;
      const to = from + action.direction;
      if (from < 0 || from >= emitters.length || to < 0 || to >= emitters.length) return state;
      const next = [...emitters];
      const [moved] = next.splice(from, 1);
      if (!moved) return state;
      next.splice(to, 0, moved);
      const selected = state.selected === from ? to : state.selected;
      return withEmitters(state, next, selected);
    }

    case 'updateEmitter': {
      const target = emitters[action.index];
      if (!target) return state;
      const updated: Record<string, EmitterFieldValue> = { ...target };
      if (action.value === undefined) {
        delete updated[action.field];
      } else {
        updated[action.field] = action.value;
      }
      const next = emitters.map((e, i) => (i === action.index ? (updated as EmitterDraft) : e));
      return withEmitters(state, next, state.selected);
    }

    case 'setEmitterType': {
      const target = emitters[action.index];
      if (!target) return state;
      const next = emitters.map((e, i) =>
        i === action.index ? convertEmitterType(target, action.emitterType) : e,
      );
      return withEmitters(state, next, state.selected);
    }
  }
}
