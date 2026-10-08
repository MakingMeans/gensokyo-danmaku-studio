import type { PlayerInput } from '../sim/player';

/** The subset of EventTarget the keyboard reader needs. Kept small so tests can fake it. */
export interface KeyEventSource {
  addEventListener(type: 'keydown' | 'keyup', listener: (event: KeyboardEvent) => void): void;
  removeEventListener(type: 'keydown' | 'keyup', listener: (event: KeyboardEvent) => void): void;
}

export interface KeyboardInput {
  /** Current movement intent derived from the held keys. */
  read(): PlayerInput;
  /** Whether a key, by `KeyboardEvent.code`, is currently held. */
  isDown(code: string): boolean;
  /** True once for the first `read` after the key was pressed. */
  wasPressed(code: string): boolean;
  dispose(): void;
}

const MOVEMENT_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'ShiftLeft',
  'ShiftRight',
]);

/**
 * Tracks held keys and turns them into a PlayerInput. This is one of the two
 * engine modules allowed to touch the DOM; everything in `sim` stays pure.
 */
export function createKeyboardInput(target: KeyEventSource): KeyboardInput {
  const down = new Set<string>();
  const pressed = new Set<string>();

  const onKeyDown = (event: KeyboardEvent): void => {
    if (MOVEMENT_KEYS.has(event.code)) event.preventDefault();
    if (!down.has(event.code)) pressed.add(event.code);
    down.add(event.code);
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    down.delete(event.code);
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);

  return {
    read() {
      const dx = (down.has('ArrowRight') ? 1 : 0) - (down.has('ArrowLeft') ? 1 : 0);
      const dy = (down.has('ArrowDown') ? 1 : 0) - (down.has('ArrowUp') ? 1 : 0);
      const focus = down.has('ShiftLeft') || down.has('ShiftRight');
      return { dx, dy, focus };
    },
    isDown: (code) => down.has(code),
    wasPressed(code) {
      const hit = pressed.has(code);
      pressed.delete(code);
      return hit;
    },
    dispose() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      down.clear();
      pressed.clear();
    },
  };
}
