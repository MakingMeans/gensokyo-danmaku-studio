import type { Dispatch } from 'react';

import { EXAMPLES } from '../state/examples';
import { DURATION_FIELD, SEED_FIELD } from '../state/fieldSpecs';
import type { EditorAction, PatternDraft } from '../state/patternReducer';
import { Slider } from './Slider';

interface PatternMetaProps {
  readonly draft: PatternDraft;
  readonly dispatch: Dispatch<EditorAction>;
}

export function PatternMeta({ draft, dispatch }: PatternMetaProps) {
  const loadExample = (id: string): void => {
    const example = EXAMPLES.find((e) => e.id === id);
    if (example) dispatch({ type: 'load', draft: structuredClone(example.draft) });
  };

  return (
    <section className="panel pattern-meta">
      <header className="panel-header">
        <h2>Pattern</h2>
        <div className="toolbar">
          <select
            aria-label="Load example"
            value=""
            onChange={(event) => loadExample(event.target.value)}
          >
            <option value="" disabled>
              Load example…
            </option>
            {EXAMPLES.map((example) => (
              <option key={example.id} value={example.id}>
                {example.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => dispatch({ type: 'reset' })}>
            New
          </button>
        </div>
      </header>

      <label className="stacked">
        Id
        <input
          type="text"
          value={typeof draft.id === 'string' ? draft.id : ''}
          placeholder="kebab-case-id"
          onChange={(event) =>
            dispatch({ type: 'setMeta', field: 'id', value: event.target.value })
          }
        />
      </label>
      <label className="stacked">
        Name
        <input
          type="text"
          value={typeof draft.name === 'string' ? draft.name : ''}
          onChange={(event) =>
            dispatch({ type: 'setMeta', field: 'name', value: event.target.value })
          }
        />
      </label>
      <Slider
        spec={DURATION_FIELD}
        value={typeof draft.duration === 'number' ? draft.duration : undefined}
        onChange={(value) => dispatch({ type: 'setMeta', field: 'duration', value })}
      />
      <Slider
        spec={SEED_FIELD}
        value={typeof draft.seed === 'number' ? draft.seed : undefined}
        onChange={(value) => dispatch({ type: 'setMeta', field: 'seed', value })}
      />
    </section>
  );
}
