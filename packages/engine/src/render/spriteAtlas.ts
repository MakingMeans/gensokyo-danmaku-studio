import { SPRITE_KEYS } from '../sprites/spriteKeys';
import type { SpriteManifest, SpriteSource } from './spriteManifest';

/** One pre-rendered sprite: a row of rotation frames on a shared sheet. */
export interface AtlasEntry {
  readonly sheet: CanvasImageSource;
  /** Cell size in pixels; frames are square and laid out left to right. */
  readonly size: number;
  readonly rotations: number;
  /** Y offset of this entry's row on the sheet. */
  readonly rowY: number;
}

export interface SpriteAtlas {
  /** Indexed by sprite index, matching `BulletPool.sprite`. */
  readonly bullets: readonly AtlasEntry[];
  readonly player: AtlasEntry;
}

/**
 * Pre-renders every sprite in the manifest, at every rotation, into one
 * offscreen canvas. The renderer then draws bullets with `drawImage`, which is
 * far cheaper than rebuilding paths per bullet and is the same code path real
 * spritesheets use.
 */
export async function buildSpriteAtlas(manifest: SpriteManifest): Promise<SpriteAtlas> {
  const sources: SpriteSource[] = [
    ...SPRITE_KEYS.map((key) => manifest.bullets[key]),
    manifest.player,
  ];
  const images = await loadImages(sources);

  const width = Math.max(...sources.map((s) => cellSize(s) * s.rotations));
  const height = sources.reduce((sum, s) => sum + cellSize(s), 0);

  const sheet = document.createElement('canvas');
  sheet.width = width;
  sheet.height = height;
  const ctx = sheet.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D context for the sprite atlas');
  ctx.imageSmoothingEnabled = false;

  const entries: AtlasEntry[] = [];
  let rowY = 0;
  for (const source of sources) {
    const size = cellSize(source);
    for (let r = 0; r < source.rotations; r++) {
      const angle = (r / source.rotations) * Math.PI * 2;
      ctx.save();
      ctx.translate(r * size + size / 2, rowY + size / 2);
      ctx.rotate(angle);
      paint(ctx, source, images);
      ctx.restore();
    }
    entries.push({ sheet, size, rotations: source.rotations, rowY });
    rowY += size;
  }

  const player = entries.pop();
  if (!player) throw new Error('Sprite atlas is missing the player entry');
  return { bullets: entries, player };
}

function cellSize(source: SpriteSource): number {
  return source.kind === 'placeholder' ? source.size : Math.max(source.sw, source.sh);
}

function paint(
  ctx: CanvasRenderingContext2D,
  source: SpriteSource,
  images: ReadonlyMap<string, HTMLImageElement>,
): void {
  if (source.kind === 'placeholder') {
    source.draw(ctx, source.color);
    return;
  }
  const image = images.get(source.src);
  if (!image) throw new Error(`Spritesheet not loaded: ${source.src}`);
  ctx.drawImage(
    image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    -source.sw / 2,
    -source.sh / 2,
    source.sw,
    source.sh,
  );
}

async function loadImages(
  sources: readonly SpriteSource[],
): Promise<Map<string, HTMLImageElement>> {
  const urls = new Set<string>();
  for (const source of sources) {
    if (source.kind === 'image') urls.add(source.src);
  }
  const list = [...urls];
  const loaded = await Promise.all(list.map(loadImage));
  return new Map(list.map((url, i) => [url, loaded[i]]));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load spritesheet: ${src}`));
    image.src = src;
  });
}
