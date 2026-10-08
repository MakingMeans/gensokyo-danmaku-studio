import {
  buildSpriteAtlas,
  CanvasRenderer,
  createFixedLoop,
  createKeyboardInput,
  createPlaceholderManifest,
  parsePattern,
  Simulation,
  type Pattern,
} from '@gds/engine';

import aimedFan from '../../../patterns/aimed-fan.json';
import spiralBloom from '../../../patterns/spiral-bloom.json';
import stressTest from '../../../patterns/stress-test.json';
import twinSpiral from '../../../patterns/twin-spiral.json';
import { createHud } from './hud';

/** Patterns are validated at startup so a broken JSON fails loudly, not mid-fight. */
function loadPatterns(): Pattern[] {
  return [spiralBloom, aimedFan, twinSpiral, stressTest].map((json) => {
    const result = parsePattern(json);
    if (!result.ok) {
      throw new Error(`Invalid pattern:\n${result.errors.join('\n')}`);
    }
    return result.pattern;
  });
}

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) throw new Error('Missing #app container');

  const patterns = loadPatterns();
  const canvas = document.createElement('canvas');
  app.appendChild(canvas);

  const atlas = await buildSpriteAtlas(createPlaceholderManifest());
  const renderer = new CanvasRenderer(canvas, atlas);
  const hud = createHud(app);
  const input = createKeyboardInput(window);

  const fit = (): void => renderer.resize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', fit);
  fit();

  let sim = new Simulation({ pattern: patterns[0] });

  const loop = createFixedLoop({
    update(dt) {
      // Pattern hotkeys are handled here so they share the simulation tick.
      patterns.forEach((pattern, index) => {
        if (input.wasPressed(`Digit${index + 1}`)) {
          sim = new Simulation({ pattern });
        }
      });
      if (input.wasPressed('KeyR')) sim.reset();

      sim.setPlayerInput(input.read());
      sim.step(dt);
      if (sim.finished) sim.reset();
    },
    render() {
      renderer.render(sim);
      hud.update(sim, loop);
    },
  });

  loop.start();
}

main().catch((error: unknown) => {
  console.error(error);
  const app = document.getElementById('app');
  if (app) app.textContent = error instanceof Error ? error.message : String(error);
});
