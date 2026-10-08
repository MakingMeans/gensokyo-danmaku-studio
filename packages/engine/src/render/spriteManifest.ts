import { SPRITE_DEFINITIONS, SPRITE_KEYS, type SpriteKey } from '../sprites/spriteKeys';
import { drawBall, drawPlayer, drawRice, drawStar, type PlaceholderDrawer } from './placeholders';

/** A sprite painted procedurally at load time. */
export interface PlaceholderSprite {
  readonly kind: 'placeholder';
  readonly draw: PlaceholderDrawer;
  readonly color: string;
  /** Width and height of the cell the drawer is rendered into, in pixels. */
  readonly size: number;
  /** Number of pre-rendered rotations. 1 for round sprites, more for directional ones. */
  readonly rotations: number;
}

/** A region of a spritesheet image loaded from `public/assets/`. */
export interface ImageSprite {
  readonly kind: 'image';
  /** URL of the spritesheet, relative to the app's public folder. */
  readonly src: string;
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  /** Number of pre-rendered rotations. Sheet art is assumed to point right. */
  readonly rotations: number;
}

export type SpriteSource = PlaceholderSprite | ImageSprite;

/**
 * Maps every sprite the renderer needs to its source. Swapping placeholders for
 * real assets only requires changing the entries here.
 */
export interface SpriteManifest {
  readonly bullets: Readonly<Record<SpriteKey, SpriteSource>>;
  readonly player: SpriteSource;
}

const DIRECTIONAL_ROTATIONS = 32;

function placeholderBullet(key: SpriteKey): PlaceholderSprite {
  const { shape, radius, color } = SPRITE_DEFINITIONS[key];
  switch (shape) {
    case 'ball':
      return { kind: 'placeholder', draw: drawBall(radius), color, size: radius * 4, rotations: 1 };
    case 'rice':
      return {
        kind: 'placeholder',
        draw: drawRice(radius),
        color,
        size: radius * 6,
        rotations: DIRECTIONAL_ROTATIONS,
      };
    case 'star':
      return { kind: 'placeholder', draw: drawStar(radius), color, size: radius * 4, rotations: 1 };
  }
}

export function createPlaceholderManifest(): SpriteManifest {
  const bullets = Object.fromEntries(
    SPRITE_KEYS.map((key) => [key, placeholderBullet(key)]),
  ) as Record<SpriteKey, SpriteSource>;
  return {
    bullets,
    player: { kind: 'placeholder', draw: drawPlayer, color: '#ff5a7a', size: 32, rotations: 1 },
  };
}
