import { parsePattern } from '@gds/engine';
import { useEffect, useMemo, useReducer } from 'react';

import { EmitterForm } from './components/EmitterForm';
import { EmitterList } from './components/EmitterList';
import { PatternMeta } from './components/PatternMeta';
import { ValidationErrors } from './components/ValidationErrors';
import { JsonPanel } from './json/JsonPanel';
import { loadDraft, saveDraft } from './lib/storage';
import { Preview } from './preview/Preview';
import { createDefaultDraft, createInitialState, patternReducer } from './state/patternReducer';

const NO_ERRORS: readonly string[] = [];

export function App() {
  const [state, dispatch] = useReducer(patternReducer, undefined, () =>
    createInitialState(loadDraft() ?? createDefaultDraft()),
  );

  useEffect(() => {
    saveDraft(state.draft);
  }, [state.draft]);

  // Validate on every change. The preview only receives patterns that pass.
  const parsed = useMemo(() => parsePattern(state.draft), [state.draft]);
  const pattern = parsed.ok ? parsed.pattern : null;
  const errors = parsed.ok ? NO_ERRORS : parsed.errors;

  const emitter = state.draft.emitters[state.selected];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gensokyo Danmaku Studio</h1>
        <span className="subtitle">Spell card editor</span>
      </header>
      <main className="layout">
        <div className="column">
          <PatternMeta draft={state.draft} dispatch={dispatch} />
          <EmitterList
            emitters={state.draft.emitters}
            selected={state.selected}
            dispatch={dispatch}
          />
        </div>
        <div className="column">
          {emitter ? (
            <EmitterForm emitter={emitter} index={state.selected} dispatch={dispatch} />
          ) : (
            <section className="panel">
              <p>Add an emitter to start.</p>
            </section>
          )}
        </div>
        <div className="column">
          <Preview pattern={pattern} />
          <ValidationErrors errors={errors} />
          <JsonPanel draft={state.draft} dispatch={dispatch} />
        </div>
      </main>
    </div>
  );
}
