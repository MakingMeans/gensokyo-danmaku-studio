import type { FixedLoop, Simulation } from '@gds/engine';

export interface Hud {
  update(sim: Simulation, loop: FixedLoop): void;
}

/** DOM overlay showing performance counters and the current pattern. */
export function createHud(container: HTMLElement): Hud {
  const root = document.createElement('div');
  root.className = 'hud';
  root.innerHTML = `
    <div class="hud-row"><span>FPS</span><strong data-fps>0</strong></div>
    <div class="hud-row"><span>Bullets</span><strong data-bullets>0</strong></div>
    <div class="hud-row"><span>Hits</span><strong data-hits>0</strong></div>
    <div class="hud-row"><span>Time</span><strong data-time>0.0</strong></div>
    <div class="hud-pattern" data-pattern></div>
    <div class="hud-help">Arrows: move · Shift: focus · 1-4: pattern · R: restart</div>
  `;
  container.appendChild(root);

  const fps = root.querySelector<HTMLElement>('[data-fps]');
  const bullets = root.querySelector<HTMLElement>('[data-bullets]');
  const hits = root.querySelector<HTMLElement>('[data-hits]');
  const time = root.querySelector<HTMLElement>('[data-time]');
  const pattern = root.querySelector<HTMLElement>('[data-pattern]');

  let lastFps = -1;
  let lastBullets = -1;
  let lastHits = -1;
  let lastTime = '';
  let lastPattern = '';

  return {
    update(sim, loop) {
      // Only touch the DOM when a value changed; layout work is not free.
      if (fps && loop.fps !== lastFps) {
        lastFps = loop.fps;
        fps.textContent = String(lastFps);
      }
      if (bullets && sim.bullets.count !== lastBullets) {
        lastBullets = sim.bullets.count;
        bullets.textContent = String(lastBullets);
      }
      if (hits && sim.hits !== lastHits) {
        lastHits = sim.hits;
        hits.textContent = String(lastHits);
      }
      const t = sim.time.toFixed(1);
      if (time && t !== lastTime) {
        lastTime = t;
        time.textContent = t;
      }
      if (pattern && sim.pattern.name !== lastPattern) {
        lastPattern = sim.pattern.name;
        pattern.textContent = `${sim.pattern.name} (${sim.pattern.id}.json)`;
      }
    },
  };
}
