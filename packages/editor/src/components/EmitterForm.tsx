import { SPRITE_DEFINITIONS, SPRITE_KEYS, type EmitterType, type SpriteKey } from '@gds/engine';
import type { Dispatch } from 'react';

import { COMMON_FIELDS, COUNT_FIELD, EMITTER_TYPES, TYPE_FIELDS } from '../state/fieldSpecs';
import type { EditorAction, EmitterDraft } from '../state/patternReducer';
import { Slider } from './Slider';

interface EmitterFormProps {
  readonly emitter: EmitterDraft;
  readonly index: number;
  readonly dispatch: Dispatch<EditorAction>;
}

function readNumber(emitter: EmitterDraft, key: string): number | undefined {
  const value = (emitter as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : undefined;
}

export function EmitterForm({ emitter, index, dispatch }: EmitterFormProps) {
  const update = (field: string, value: number | string | boolean | undefined): void => {
    dispatch({ type: 'updateEmitter', index, field, value });
  };

  const count = readNumber(emitter, 'count');
  const sprite = typeof emitter.sprite === 'string' ? emitter.sprite : 'rice-red';

  return (
    <section className="panel emitter-form">
      <header className="panel-header">
        <h2>Emitter {index + 1}</h2>
        <label className="inline">
          Type
          <select
            value={emitter.type}
            onChange={(event) =>
              dispatch({
                type: 'setEmitterType',
                index,
                emitterType: event.target.value as EmitterType,
              })
            }
          >
            {EMITTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </header>

      <h3>Shape</h3>
      {TYPE_FIELDS[emitter.type].map((spec) => (
        <Slider
          key={spec.key}
          spec={spec}
          value={readNumber(emitter, spec.key)}
          onChange={(value) => update(spec.key, value)}
        />
      ))}

      <h3>Timing and motion</h3>
      {COMMON_FIELDS.map((spec) => (
        <Slider
          key={spec.key}
          spec={spec}
          value={readNumber(emitter, spec.key)}
          onChange={(value) => update(spec.key, value)}
        />
      ))}

      <div className="field-toggle">
        <label className="inline">
          <input
            type="checkbox"
            checked={count !== undefined}
            onChange={(event) =>
              update('count', event.target.checked ? COUNT_FIELD.min : undefined)
            }
          />
          Limit shots
        </label>
        {count !== undefined ? (
          <Slider spec={COUNT_FIELD} value={count} onChange={(value) => update('count', value)} />
        ) : null}
      </div>

      <h3>Targeting and look</h3>
      <label className="inline" title="Add the angle from the emitter to the player">
        <input
          type="checkbox"
          checked={emitter.aimed === true}
          onChange={(event) => update('aimed', event.target.checked)}
        />
        Aimed at the player
      </label>

      <label className="inline">
        Sprite
        <select value={sprite} onChange={(event) => update('sprite', event.target.value)}>
          {SPRITE_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span
          className="swatch"
          style={{ background: SPRITE_DEFINITIONS[sprite as SpriteKey]?.color ?? '#888' }}
        />
      </label>
    </section>
  );
}
