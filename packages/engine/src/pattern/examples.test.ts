import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parsePatternJson } from './parse';

const patternsDir = join(import.meta.dirname, '../../../../patterns');
const files = readdirSync(patternsDir).filter((file) => file.endsWith('.json'));

describe('example patterns in /patterns', () => {
  it('ships at least three examples', () => {
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it.each(files)('%s is a valid pattern whose id matches the file name', (file) => {
    const result = parsePatternJson(readFileSync(join(patternsDir, file), 'utf8'));
    expect(result.ok, result.ok ? '' : result.errors.join('\n')).toBe(true);
    if (!result.ok) return;
    expect(`${result.pattern.id}.json`).toBe(file);
  });
});
