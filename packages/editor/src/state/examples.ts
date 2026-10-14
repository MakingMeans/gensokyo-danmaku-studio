import aimedFan from '../../../../patterns/aimed-fan.json';
import spiralBloom from '../../../../patterns/spiral-bloom.json';
import stressTest from '../../../../patterns/stress-test.json';
import twinSpiral from '../../../../patterns/twin-spiral.json';
import type { PatternDraft } from './patternReducer';

export interface ExamplePattern {
  readonly id: string;
  readonly name: string;
  readonly draft: PatternDraft;
}

/**
 * The shared patterns from /patterns, bundled at build time. The JSON files are
 * validated by the engine test suite, so the cast below is safe.
 */
export const EXAMPLES: readonly ExamplePattern[] = [
  spiralBloom,
  aimedFan,
  twinSpiral,
  stressTest,
].map((json) => ({ id: json.id, name: json.name, draft: json as PatternDraft }));
