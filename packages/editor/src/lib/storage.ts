import { importPatternText, serializePattern } from '../json/serialize';
import type { PatternDraft } from '../state/patternReducer';

const STORAGE_KEY = 'gds.editor.draft';

/** Restores the last draft, or null when nothing valid is stored. Never throws. */
export function loadDraft(): PatternDraft | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    const result = importPatternText(text);
    return result.ok ? result.draft : null;
  } catch {
    return null;
  }
}

/** Persists the draft so a reload does not lose work. Never throws. */
export function saveDraft(draft: PatternDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializePattern(draft));
  } catch {
    // Private mode or a full quota: losing autosave is acceptable.
  }
}
