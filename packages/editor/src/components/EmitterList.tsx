import { SPRITE_DEFINITIONS, type SpriteKey } from '@gds/engine';
import type { Dispatch } from 'react';

import { EMITTER_TYPES } from '../state/fieldSpecs';
import type { EditorAction, EmitterDraft } from '../state/patternReducer';

interface EmitterListProps {
  readonly emitters: readonly EmitterDraft[];
  readonly selected: number;
  readonly dispatch: Dispatch<EditorAction>;
}

function summary(emitter: EmitterDraft): string {
  switch (emitter.type) {
    case 'ring':
      return `${emitter.bullets} bullets`;
    case 'spread':
      return `${emitter.bullets} bullets, ${emitter.spread}°`;
    case 'spiral':
      return `${emitter.streams ?? 1} streams`;
  }
}

export function EmitterList({ emitters, selected, dispatch }: EmitterListProps) {
  const canRemove = emitters.length > 1;

  return (
    <section className="panel emitter-list">
      <header className="panel-header">
        <h2>Layers</h2>
      </header>
      <ol className="layers">
        {emitters.map((emitter, index) => {
          const sprite = typeof emitter.sprite === 'string' ? emitter.sprite : 'rice-red';
          const color = SPRITE_DEFINITIONS[sprite as SpriteKey]?.color ?? '#888';
          return (
            <li key={index}>
              <button
                type="button"
                className={index === selected ? 'layer selected' : 'layer'}
                onClick={() => dispatch({ type: 'select', index })}
              >
                <span className="swatch" style={{ background: color }} />
                <span className="layer-type">{emitter.type}</span>
                <span className="layer-summary">{summary(emitter)}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="toolbar">
        {EMITTER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => dispatch({ type: 'addEmitter', emitterType: type })}
          >
            + {type}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <button
          type="button"
          onClick={() => dispatch({ type: 'duplicateEmitter', index: selected })}
        >
          Duplicate
        </button>
        <button
          type="button"
          disabled={selected === 0}
          onClick={() => dispatch({ type: 'moveEmitter', index: selected, direction: -1 })}
        >
          Up
        </button>
        <button
          type="button"
          disabled={selected >= emitters.length - 1}
          onClick={() => dispatch({ type: 'moveEmitter', index: selected, direction: 1 })}
        >
          Down
        </button>
        <button
          type="button"
          className="danger"
          disabled={!canRemove}
          onClick={() => dispatch({ type: 'removeEmitter', index: selected })}
        >
          Remove
        </button>
      </div>
    </section>
  );
}
