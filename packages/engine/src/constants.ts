/** Internal playfield width in pixels (classic Touhou proportions). */
export const PLAYFIELD_WIDTH = 384;

/** Internal playfield height in pixels (classic Touhou proportions). */
export const PLAYFIELD_HEIGHT = 448;

/** Simulation updates per second. Rendering may run faster. */
export const FIXED_UPDATES_PER_SECOND = 60;

/** Duration of one simulation step in seconds. */
export const FIXED_DT = 1 / FIXED_UPDATES_PER_SECOND;

/** Default bullet pool capacity. */
export const DEFAULT_BULLET_CAPACITY = 8192;
