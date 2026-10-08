/**
 * Angle helpers.
 *
 * Patterns use degrees: 0 points right and angles increase clockwise, which is
 * the natural convention for a canvas whose y axis grows downwards. The
 * simulation works in radians with the same orientation, so no axis flip is
 * needed when converting.
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function degToRad(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export function radToDeg(radians: number): number {
  return radians * RAD_TO_DEG;
}

/** Wraps any angle in degrees into [0, 360). */
export function normalizeDegrees(degrees: number): number {
  // Double modulo so negative inputs and -0 both land in [0, 360).
  return ((degrees % 360) + 360) % 360;
}

/** Angle in degrees from (fromX, fromY) towards (toX, toY), using the canvas convention. */
export function angleBetween(fromX: number, fromY: number, toX: number, toY: number): number {
  return radToDeg(Math.atan2(toY - fromY, toX - fromX));
}
