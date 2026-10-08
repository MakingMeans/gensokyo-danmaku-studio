import type { z } from 'zod';

import { patternSchema, type Pattern } from './schema';

export type ParseResult =
  | { readonly ok: true; readonly pattern: Pattern }
  | { readonly ok: false; readonly errors: readonly string[] };

/**
 * Turns a zod issue path like ['emitters', 0, 'speed'] into `emitters[0].speed`.
 * The root path is reported as `pattern` so every error has a subject.
 */
export function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return 'pattern';
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`;
    return acc === '' ? String(segment) : `${acc}.${String(segment)}`;
  }, '');
}

export function formatIssues(issues: readonly z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`);
}

/** Validates an already-parsed JSON value and applies defaults. Never throws. */
export function parsePattern(input: unknown): ParseResult {
  const result = patternSchema.safeParse(input);
  if (result.success) {
    return { ok: true, pattern: result.data };
  }
  return { ok: false, errors: formatIssues(result.error.issues) };
}

/** Parses raw JSON text. Syntax errors are reported in the same shape as schema errors. */
export function parsePatternJson(text: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON';
    return { ok: false, errors: [`pattern: ${message}`] };
  }
  return parsePattern(value);
}
