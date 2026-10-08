import { describe, expect, it } from 'vitest';

import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '../constants';
import {
  createPlayer,
  DEFAULT_PLAYER_CONFIG,
  isInvulnerable,
  resetPlayer,
  updatePlayer,
} from './player';

describe('player', () => {
  it('starts near the bottom centre of the playfield', () => {
    const player = createPlayer();
    expect(player.x).toBe(PLAYFIELD_WIDTH / 2);
    expect(player.y).toBeLessThan(PLAYFIELD_HEIGHT);
    expect(player.y).toBeGreaterThan(PLAYFIELD_HEIGHT * 0.75);
  });

  it('moves at the configured speed', () => {
    const player = createPlayer();
    const startX = player.x;
    updatePlayer(player, { dx: 1, dy: 0, focus: false }, 0.5);
    expect(player.x).toBeCloseTo(startX + DEFAULT_PLAYER_CONFIG.speed * 0.5);
  });

  it('moves slower while focused', () => {
    const player = createPlayer();
    const startX = player.x;
    updatePlayer(player, { dx: 1, dy: 0, focus: true }, 0.5);
    expect(player.x).toBeCloseTo(startX + DEFAULT_PLAYER_CONFIG.focusSpeed * 0.5);
    expect(player.focus).toBe(true);
  });

  it('normalises diagonal movement so it is not faster', () => {
    const player = createPlayer();
    const { x: startX, y: startY } = player;
    updatePlayer(player, { dx: 1, dy: 1, focus: false }, 0.1);
    const travelled = Math.hypot(player.x - startX, player.y - startY);
    expect(travelled).toBeCloseTo(DEFAULT_PLAYER_CONFIG.speed * 0.1);
  });

  it('clamps to the playfield with a margin', () => {
    const player = createPlayer();
    updatePlayer(player, { dx: -1, dy: 1, focus: false }, 100);
    expect(player.x).toBe(DEFAULT_PLAYER_CONFIG.margin);
    expect(player.y).toBe(PLAYFIELD_HEIGHT - DEFAULT_PLAYER_CONFIG.margin);
    updatePlayer(player, { dx: 1, dy: -1, focus: false }, 100);
    expect(player.x).toBe(PLAYFIELD_WIDTH - DEFAULT_PLAYER_CONFIG.margin);
    expect(player.y).toBe(DEFAULT_PLAYER_CONFIG.margin);
  });

  it('reports invulnerability relative to simulation time', () => {
    const player = createPlayer();
    player.invulnerableUntil = 3;
    expect(isInvulnerable(player, 2.9)).toBe(true);
    expect(isInvulnerable(player, 3)).toBe(false);
  });

  it('resets position, focus and invulnerability', () => {
    const player = createPlayer();
    updatePlayer(player, { dx: 1, dy: -1, focus: true }, 1);
    player.invulnerableUntil = 10;
    resetPlayer(player);
    expect(player.x).toBe(PLAYFIELD_WIDTH / 2);
    expect(player.focus).toBe(false);
    expect(player.invulnerableUntil).toBe(0);
  });
});
