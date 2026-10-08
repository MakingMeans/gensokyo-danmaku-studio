/**
 * Sprite catalogue shared by the pattern schema and the renderer.
 *
 * Keys are stable identifiers used inside pattern JSON. Each key carries the
 * collision radius and a placeholder description, so swapping placeholders for
 * real sprites only requires changing the renderer manifest, never the patterns.
 */

export type PlaceholderShape = 'ball' | 'rice' | 'star';

export interface SpriteDefinition {
  /** Collision radius in pixels. Smaller than the drawn sprite, as in the genre. */
  readonly radius: number;
  /** Shape used by the placeholder drawer until real assets exist. */
  readonly shape: PlaceholderShape;
  /** CSS color used by the placeholder drawer. */
  readonly color: string;
}

export const SPRITE_DEFINITIONS = {
  'ball-red': { radius: 4, shape: 'ball', color: '#ff4d4d' },
  'ball-blue': { radius: 4, shape: 'ball', color: '#4da6ff' },
  'ball-green': { radius: 4, shape: 'ball', color: '#5ce65c' },
  'ball-purple': { radius: 4, shape: 'ball', color: '#c266ff' },
  'rice-red': { radius: 3, shape: 'rice', color: '#ff6666' },
  'rice-blue': { radius: 3, shape: 'rice', color: '#66b3ff' },
  'rice-green': { radius: 3, shape: 'rice', color: '#80ff80' },
  'star-yellow': { radius: 5, shape: 'star', color: '#ffe066' },
} as const satisfies Record<string, SpriteDefinition>;

export type SpriteKey = keyof typeof SPRITE_DEFINITIONS;

/** Ordered list of sprite keys. The index is what the bullet pool stores per bullet. */
export const SPRITE_KEYS = Object.keys(SPRITE_DEFINITIONS) as readonly SpriteKey[];

export function spriteIndex(key: SpriteKey): number {
  return SPRITE_KEYS.indexOf(key);
}
