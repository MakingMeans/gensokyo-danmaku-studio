import { z } from 'zod';

import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';
import { SPRITE_KEYS } from '../sprites/spriteKeys';

/**
 * Pattern schema. This is the single source of truth for the pattern format:
 * the TypeScript types below are inferred from it.
 *
 * Units:
 * - time in seconds
 * - speed in pixels per second, acceleration in pixels per second squared
 * - angles in degrees; 0 points right and angles increase clockwise (canvas convention)
 * - positions in playfield pixels, origin at the top-left corner
 */

export const PATTERN_VERSION = 1;

const seconds = z.number().finite();
const degrees = z.number().finite();

const spriteKeySchema = z.enum(SPRITE_KEYS as [string, ...string[]]);

/** Fields every emitter shares, with defaults so hand-written JSON stays short. */
const emitterBaseSchema = z.object({
  start: seconds
    .min(0)
    .default(0)
    .describe('Seconds after the pattern starts before the first shot'),
  interval: seconds.positive().describe('Seconds between consecutive shots'),
  count: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Total number of shots; omit to keep firing until the pattern ends'),
  x: z
    .number()
    .finite()
    .min(0)
    .max(PLAYFIELD_WIDTH)
    .default(PLAYFIELD_WIDTH / 2)
    .describe('Emitter x position in playfield pixels'),
  y: z
    .number()
    .finite()
    .min(0)
    .max(PLAYFIELD_HEIGHT)
    .default(PLAYFIELD_HEIGHT / 4)
    .describe('Emitter y position in playfield pixels'),
  speed: z.number().finite().min(0).describe('Initial bullet speed in pixels per second'),
  acceleration: z
    .number()
    .finite()
    .default(0)
    .describe('Acceleration along the bullet direction in pixels per second squared'),
  angle: degrees.default(0).describe('Base angle in degrees; 0 points right, clockwise positive'),
  spin: degrees
    .default(0)
    .describe('Degrees per second added to the base angle while the emitter is active'),
  aimed: z.boolean().default(false).describe('Add the angle from the emitter to the player'),
  sprite: spriteKeySchema.default('rice-red').describe('Sprite key from the sprite catalogue'),
});

const ringEmitterSchema = emitterBaseSchema.extend({
  type: z.literal('ring'),
  bullets: z.number().int().min(1).max(360).describe('Bullets evenly spaced around 360 degrees'),
});

const spreadEmitterSchema = emitterBaseSchema.extend({
  type: z.literal('spread'),
  bullets: z.number().int().min(1).max(360).describe('Bullets evenly spaced across the fan'),
  spread: degrees.min(0).max(360).describe('Total fan width in degrees, centred on the angle'),
});

const spiralEmitterSchema = emitterBaseSchema.extend({
  type: z.literal('spiral'),
  streams: z
    .number()
    .int()
    .min(1)
    .max(64)
    .default(1)
    .describe('Rotating streams evenly spaced around 360 degrees, one bullet each per shot'),
});

export const emitterSchema = z.discriminatedUnion('type', [
  ringEmitterSchema,
  spreadEmitterSchema,
  spiralEmitterSchema,
]);

export const patternSchema = z
  .object({
    version: z.literal(PATTERN_VERSION).describe('Pattern format version'),
    id: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'must be kebab-case: lowercase letters, digits and hyphens',
      )
      .describe('Stable identifier, kebab-case'),
    name: z.string().trim().min(1).max(80).describe('Display name'),
    duration: seconds.positive().describe('Pattern length in seconds'),
    seed: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('Seed for the deterministic random number generator'),
    emitters: z.array(emitterSchema).min(1).describe('Emitter layers, all running in parallel'),
  })
  .superRefine((pattern, ctx) => {
    pattern.emitters.forEach((emitter, index) => {
      if (emitter.start >= pattern.duration) {
        ctx.addIssue({
          code: 'custom',
          path: ['emitters', index, 'start'],
          message: `must be lower than the pattern duration (${pattern.duration}s)`,
        });
      }
    });
  });

/** A validated pattern with every default applied. */
export type Pattern = z.infer<typeof patternSchema>;
/** The loose shape accepted as input, before defaults are applied. */
export type PatternInput = z.input<typeof patternSchema>;
export type Emitter = z.infer<typeof emitterSchema>;
/** The loose emitter shape accepted as input, before defaults are applied. */
export type EmitterInput = z.input<typeof emitterSchema>;
export type EmitterType = Emitter['type'];
export type RingEmitter = z.infer<typeof ringEmitterSchema>;
export type SpreadEmitter = z.infer<typeof spreadEmitterSchema>;
export type SpiralEmitter = z.infer<typeof spiralEmitterSchema>;
