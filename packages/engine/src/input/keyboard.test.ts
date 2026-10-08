import { describe, expect, it, vi } from 'vitest';

import { createKeyboardInput, type KeyEventSource } from './keyboard';

type Listener = (event: KeyboardEvent) => void;

/** Fake event source that records listeners and lets tests emit key events. */
function createFakeTarget() {
  const listeners = { keydown: new Set<Listener>(), keyup: new Set<Listener>() };
  const source: KeyEventSource = {
    addEventListener: (type, listener) => listeners[type].add(listener),
    removeEventListener: (type, listener) => listeners[type].delete(listener),
  };
  /** Emits a key event and returns its preventDefault mock. */
  const emit = (type: 'keydown' | 'keyup', code: string) => {
    const preventDefault = vi.fn();
    const event = { code, preventDefault } as unknown as KeyboardEvent;
    for (const listener of listeners[type]) listener(event);
    return preventDefault;
  };
  return { source, emit, listeners };
}

describe('createKeyboardInput', () => {
  it('reads idle input when nothing is held', () => {
    const { source } = createFakeTarget();
    const input = createKeyboardInput(source);
    expect(input.read()).toEqual({ dx: 0, dy: 0, focus: false });
  });

  it('maps arrow keys to movement axes', () => {
    const { source, emit } = createFakeTarget();
    const input = createKeyboardInput(source);
    emit('keydown', 'ArrowRight');
    emit('keydown', 'ArrowUp');
    expect(input.read()).toEqual({ dx: 1, dy: -1, focus: false });
    emit('keyup', 'ArrowRight');
    emit('keydown', 'ArrowLeft');
    expect(input.read()).toEqual({ dx: -1, dy: -1, focus: false });
  });

  it('cancels out opposite keys', () => {
    const { source, emit } = createFakeTarget();
    const input = createKeyboardInput(source);
    emit('keydown', 'ArrowLeft');
    emit('keydown', 'ArrowRight');
    expect(input.read().dx).toBe(0);
  });

  it('maps either shift key to focus', () => {
    const { source, emit } = createFakeTarget();
    const input = createKeyboardInput(source);
    emit('keydown', 'ShiftRight');
    expect(input.read().focus).toBe(true);
    emit('keyup', 'ShiftRight');
    emit('keydown', 'ShiftLeft');
    expect(input.read().focus).toBe(true);
  });

  it('prevents the browser default for movement keys only', () => {
    const { source, emit } = createFakeTarget();
    createKeyboardInput(source);
    expect(emit('keydown', 'ArrowDown')).toHaveBeenCalled();
    expect(emit('keydown', 'KeyZ')).not.toHaveBeenCalled();
  });

  it('reports a press once until the key is released and pressed again', () => {
    const { source, emit } = createFakeTarget();
    const input = createKeyboardInput(source);
    emit('keydown', 'Digit1');
    expect(input.wasPressed('Digit1')).toBe(true);
    expect(input.wasPressed('Digit1')).toBe(false);
    emit('keydown', 'Digit1');
    expect(input.wasPressed('Digit1')).toBe(false);
    emit('keyup', 'Digit1');
    emit('keydown', 'Digit1');
    expect(input.wasPressed('Digit1')).toBe(true);
    expect(input.isDown('Digit1')).toBe(true);
  });

  it('removes listeners and clears state on dispose', () => {
    const { source, emit, listeners } = createFakeTarget();
    const input = createKeyboardInput(source);
    emit('keydown', 'ArrowLeft');
    input.dispose();
    expect(listeners.keydown.size).toBe(0);
    expect(listeners.keyup.size).toBe(0);
    expect(input.read().dx).toBe(0);
  });
});
