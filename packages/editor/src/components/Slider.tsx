import { useId } from 'react';

import type { FieldSpec } from '../state/fieldSpecs';

interface SliderProps {
  readonly spec: FieldSpec;
  readonly value: number | undefined;
  readonly onChange: (value: number) => void;
}

/** A range input paired with a number input, both bound to the same value. */
export function Slider({ spec, value, onChange }: SliderProps) {
  const id = useId();
  const current = value ?? spec.fallback ?? spec.min;

  const handle = (raw: string): void => {
    const next = Number(raw);
    if (Number.isFinite(next)) onChange(next);
  };

  return (
    <div className="field" title={spec.hint}>
      <label htmlFor={id}>
        {spec.label}
        {spec.unit ? <span className="unit">{spec.unit}</span> : null}
      </label>
      <input
        id={id}
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={current}
        onChange={(event) => handle(event.target.value)}
      />
      <input
        type="number"
        aria-label={`${spec.label} value`}
        min={spec.hard ? spec.min : undefined}
        max={spec.hard ? spec.max : undefined}
        step={spec.step}
        value={current}
        onChange={(event) => handle(event.target.value)}
      />
    </div>
  );
}
