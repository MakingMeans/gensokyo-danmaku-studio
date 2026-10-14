import { parsePattern, type PatternInput } from '@gds/engine';

import type { PatternDraft } from '../state/patternReducer';

export type ImportResult =
  | { readonly ok: true; readonly draft: PatternDraft }
  | { readonly ok: false; readonly errors: readonly string[] };

const PATTERN_KEY_ORDER = ['version', 'id', 'name', 'duration', 'seed', 'emitters'];
const EMITTER_KEY_ORDER = [
  'type',
  'start',
  'interval',
  'count',
  'x',
  'y',
  'bullets',
  'streams',
  'spread',
  'speed',
  'acceleration',
  'angle',
  'spin',
  'aimed',
  'sprite',
];

/** Returns a copy with known keys first, in a fixed order, and any others after. */
function orderKeys<T extends object>(value: T, order: readonly string[]): T {
  const entries = Object.entries(value);
  const rank = (key: string): number => {
    const index = order.indexOf(key);
    return index === -1 ? order.length : index;
  };
  entries.sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  return Object.fromEntries(entries) as T;
}

/**
 * Serializes the draft exactly as the user built it, with stable key order.
 * Defaults are not expanded so exported files stay as short as hand-written ones.
 */
export function serializePattern(draft: PatternDraft): string {
  const ordered = orderKeys(
    { ...draft, emitters: draft.emitters.map((e) => orderKeys(e, EMITTER_KEY_ORDER)) },
    PATTERN_KEY_ORDER,
  );
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * Parses and validates pattern text. On success the draft is the file content
 * as written, not the defaults-expanded version, so export round-trips cleanly.
 */
export function importPatternText(text: string): ImportResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON';
    return { ok: false, errors: [`pattern: ${message}`] };
  }
  const result = parsePattern(value);
  if (!result.ok) return result;
  // parsePattern succeeded, so the raw value conforms to the input shape.
  return { ok: true, draft: value as PatternInput };
}

export function patternFileName(draft: PatternDraft): string {
  const id = typeof draft.id === 'string' && draft.id.length > 0 ? draft.id : 'pattern';
  return `${id}.json`;
}
