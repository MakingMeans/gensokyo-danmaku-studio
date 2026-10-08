import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from '@gds/engine';

// Placeholder entry point. The playable demo is wired up later in Stage 1.
const app = document.getElementById('app');
if (app) {
  app.textContent = `Gensokyo Danmaku Studio — playfield ${PLAYFIELD_WIDTH}×${PLAYFIELD_HEIGHT}`;
}
