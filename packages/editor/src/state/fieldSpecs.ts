import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH, type EmitterType } from '@gds/engine';

/**
 * Slider configuration for every numeric field. Bounds marked `hard` come from
 * the schema and are enforced by a test; the others are editing conveniences.
 */
export interface FieldSpec {
  readonly key: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit?: string;
  /** True when `min` and `max` are the limits the schema enforces. */
  readonly hard: boolean;
  /** Value the schema applies when the field is omitted. Absent for required fields. */
  readonly fallback?: number;
  readonly hint: string;
}

export const DURATION_FIELD: FieldSpec = {
  key: 'duration',
  label: 'Duration',
  min: 1,
  max: 60,
  step: 0.5,
  unit: 's',
  hard: false,
  hint: 'Pattern length. Emitters stop firing afterwards.',
};

export const SEED_FIELD: FieldSpec = {
  key: 'seed',
  label: 'Seed',
  min: 0,
  max: 9999,
  step: 1,
  hard: false,
  fallback: 0,
  hint: 'Seed for the deterministic random number generator.',
};

/** Fields shared by every emitter type, in display order. */
export const COMMON_FIELDS: readonly FieldSpec[] = [
  {
    key: 'start',
    label: 'Start',
    min: 0,
    max: 30,
    step: 0.1,
    unit: 's',
    hard: false,
    fallback: 0,
    hint: 'Delay before the first shot.',
  },
  {
    key: 'interval',
    label: 'Interval',
    min: 0.02,
    max: 3,
    step: 0.01,
    unit: 's',
    hard: false,
    hint: 'Seconds between shots.',
  },
  {
    key: 'x',
    label: 'X',
    min: 0,
    max: PLAYFIELD_WIDTH,
    step: 1,
    unit: 'px',
    hard: true,
    fallback: PLAYFIELD_WIDTH / 2,
    hint: 'Emitter position from the left edge.',
  },
  {
    key: 'y',
    label: 'Y',
    min: 0,
    max: PLAYFIELD_HEIGHT,
    step: 1,
    unit: 'px',
    hard: true,
    fallback: PLAYFIELD_HEIGHT / 4,
    hint: 'Emitter position from the top edge.',
  },
  {
    key: 'speed',
    label: 'Speed',
    min: 0,
    max: 600,
    step: 1,
    unit: 'px/s',
    hard: false,
    hint: 'Initial bullet speed.',
  },
  {
    key: 'acceleration',
    label: 'Acceleration',
    min: -300,
    max: 300,
    step: 1,
    unit: 'px/s²',
    hard: false,
    fallback: 0,
    hint: 'Along the bullet direction. Negative slows bullets down.',
  },
  {
    key: 'angle',
    label: 'Angle',
    min: -180,
    max: 180,
    step: 1,
    unit: '°',
    hard: false,
    fallback: 0,
    hint: '0° points right, clockwise is positive. Added to the aim when aimed.',
  },
  {
    key: 'spin',
    label: 'Spin',
    min: -360,
    max: 360,
    step: 1,
    unit: '°/s',
    hard: false,
    fallback: 0,
    hint: 'Rotation of the base angle over time.',
  },
];

/** Optional shot limit, shown behind a toggle because the schema allows omitting it. */
export const COUNT_FIELD: FieldSpec = {
  key: 'count',
  label: 'Shots',
  min: 1,
  max: 200,
  step: 1,
  hard: false,
  hint: 'Total shots. Leave unlimited to fire until the pattern ends.',
};

const BULLETS_FIELD: FieldSpec = {
  key: 'bullets',
  label: 'Bullets',
  min: 1,
  max: 360,
  step: 1,
  hard: true,
  hint: 'Bullets per shot.',
};

/** Fields specific to each emitter type. */
export const TYPE_FIELDS: Readonly<Record<EmitterType, readonly FieldSpec[]>> = {
  ring: [BULLETS_FIELD],
  spread: [
    BULLETS_FIELD,
    {
      key: 'spread',
      label: 'Spread',
      min: 0,
      max: 360,
      step: 1,
      unit: '°',
      hard: true,
      hint: 'Total fan width, centred on the angle.',
    },
  ],
  spiral: [
    {
      key: 'streams',
      label: 'Streams',
      min: 1,
      max: 64,
      step: 1,
      hard: true,
      fallback: 1,
      hint: 'Rotating arms, evenly spaced. One bullet each per shot.',
    },
  ],
};

export const EMITTER_TYPES: readonly EmitterType[] = ['ring', 'spread', 'spiral'];
