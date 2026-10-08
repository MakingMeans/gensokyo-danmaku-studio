/**
 * Pure angle math for each emitter type. These functions return the angle in
 * degrees of bullet `index` within one shot, so callers can loop without
 * allocating an array per shot.
 */

/** Bullet `index` of `bullets` evenly spaced around a full circle, starting at `baseAngle`. */
export function ringAngle(index: number, bullets: number, baseAngle: number): number {
  return baseAngle + (index * 360) / bullets;
}

/**
 * Bullet `index` of `bullets` evenly spaced across a fan of `spread` degrees
 * centred on `baseAngle`. A single bullet sits exactly on the centre.
 */
export function spreadAngle(
  index: number,
  bullets: number,
  spread: number,
  baseAngle: number,
): number {
  if (bullets <= 1) return baseAngle;
  return baseAngle - spread / 2 + (index * spread) / (bullets - 1);
}

/** Stream `index` of `streams` evenly spaced around a full circle, starting at `baseAngle`. */
export function spiralAngle(index: number, streams: number, baseAngle: number): number {
  return ringAngle(index, streams, baseAngle);
}

/** Base angle of an emitter at `elapsed` seconds since it started, including spin. */
export function spunAngle(angle: number, spin: number, elapsed: number): number {
  return angle + spin * elapsed;
}
