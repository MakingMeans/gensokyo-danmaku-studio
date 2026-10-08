# CLAUDE.md — Gensokyo Danmaku Studio

## Communication
- Talk to me in **Spanish**. Write all code, comments, commit messages, and docs in **English**.
- I'm building this for my GitHub portfolio. Explain important decisions briefly so I understand and can defend them in an interview.
- If something is ambiguous, ask before assuming. Do not add dependencies without asking first.

## Project overview
A Touhou-inspired bullet hell toolkit with three packages sharing one core:
- `engine`: a framework-agnostic danmaku engine that reads bullet patterns from JSON and runs them efficiently.
- `editor`: a web tool to design spell cards visually with sliders and a live preview, export/import JSON, and a "Test Play" mode.
- `game`: a short playable boss fight whose spell cards are all JSON patterns made in the editor.

The key story of the project: **the editor creates content, the game consumes it, and both run on the same engine.** Keep that separation clean.

See `README.md` for the public-facing description, roadmap, and credits.

## Tech stack
- TypeScript (strict mode, no `any`, no `@ts-ignore` without a comment explaining why)
- HTML5 Canvas 2D for rendering
- Vite for dev and builds
- pnpm workspaces (monorepo)
- `engine`: no runtime dependencies except `zod` for pattern schema validation
- `editor`: React + TypeScript
- `game`: vanilla TypeScript + Canvas (no framework)
- Vitest for tests
- ESLint + Prettier
- GitHub Actions for CI and deployment to GitHub Pages

## Repository structure
```
gensokyo-danmaku-studio/
├── packages/
│   ├── engine/     # Core: simulation, bullet pool, emitters, collisions, pattern schema, renderer
│   ├── editor/     # React app: spell card editor
│   └── game/       # Vanilla TS app: playable boss fight
├── patterns/       # Shared JSON patterns (created by the editor, loaded by the game)
├── docs/           # Screenshots and GIFs for the README
└── .github/workflows/
```

## Engine architecture
- **Separate simulation from rendering.** The simulation (bullets, emitters, player, collisions) must be pure TypeScript with no DOM access, so it's fully testable. The Canvas renderer is a separate module that reads simulation state.
- **Fixed timestep game loop** at 60 updates per second, with an accumulator. Rendering can run at display refresh rate.
- **Playfield:** internal resolution of 384×448 (classic Touhou proportions), scaled to fit the screen with integer scaling when possible. Disable image smoothing for pixel art.
- **Object pooling:** bullets live in a fixed-capacity pool (target: at least 5,000 active bullets at 60 FPS on a mid-range laptop). Prefer a struct-of-arrays layout with typed arrays (`Float32Array`) for positions, velocities, etc. No allocations per bullet per frame.
- **Collisions:** circle vs circle. The player has a tiny hitbox (about 2–3 px radius) that's visible in focus mode. Bullets have their own radius per sprite type.
- **Determinism:** any randomness in patterns must use a seeded RNG so a pattern always behaves the same way.
- **Units:** seconds for time, pixels per second for speed, degrees for angles in JSON (convert to radians internally). 0° points right, angles increase clockwise (canvas convention). Document this in the schema.

## Pattern format
Patterns are JSON validated with a `zod` schema in `engine`. The TypeScript types are inferred from that schema; the schema is the single source of truth. Include a `version` field so the format can evolve.

Starting point (refine it, but keep it simple and readable):
```json
{
  "version": 1,
  "id": "spiral-bloom",
  "name": "Spiral Bloom",
  "duration": 10,
  "emitters": [
    {
      "type": "ring",
      "start": 0,
      "interval": 0.2,
      "bullets": 24,
      "speed": 120,
      "acceleration": 0,
      "angle": 0,
      "spin": 15,
      "aimed": false,
      "sprite": "rice-red"
    }
  ]
}
```
Initial emitter types:
- `ring`: N bullets evenly spaced around 360°.
- `spread`: N bullets in a fan of `spread` degrees, optionally `aimed` at the player.
- `spiral`: one or more streams whose angle rotates by `spin` degrees per second.

Invalid patterns must fail with clear, human-readable error messages (the editor will show them).

## Assets — IMPORTANT
- This is an **unofficial Touhou Project fan work**. Follow the Touhou Project fan creator guidelines: https://touhou-project.news/guidelines_en/
- **Never** use, download, recreate, or reference assets extracted from the official Touhou games (sprites, music, sound effects, backgrounds).
- I will download free community asset packs manually from itch.io and place them in the app's `public/assets/` folder. Do not try to download them yourself.
- Until real assets exist, render **placeholders drawn with Canvas** (colored circles, rice/ellipse shapes, simple player and boss shapes).
- Use an **asset manifest** that maps sprite keys (like `rice-red`) to either a placeholder drawer or a region of a spritesheet, so swapping placeholders for real sprites only requires editing the manifest.
- Whenever a real asset is added, update the **Credits** section of `README.md` with the pack name, author, and link, and respect each pack's license.

## Coding conventions
- Small, focused modules. Pure functions where possible.
- Write Vitest tests for engine logic: bullet pool, emitter math, collisions, pattern validation, the fixed-timestep loop.
- Keep `pnpm lint`, `pnpm typecheck`, and `pnpm test` passing at all times.
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Commit after each meaningful step. **Never push, force push, or rewrite history unless I ask.**

## Root scripts (expected)
- `pnpm dev:editor`, `pnpm dev:game`
- `pnpm build` (builds everything)
- `pnpm test`, `pnpm lint`, `pnpm typecheck`

## Deployment
- Both apps deploy to GitHub Pages from one workflow: the game at `/<repo>/game/` and the editor at `/<repo>/editor/`, with a simple landing page at the root linking to both.
- Configure Vite's `base` correctly for these subpaths.
- CI runs lint, typecheck, and tests on every push and pull request.

## Roadmap — work one stage at a time
Do not start a stage until the previous one is done and I approve it.

**Stage 1 — Engine (current)**
- Monorepo setup: pnpm workspaces, TypeScript, ESLint, Prettier, Vitest, CI workflow.
- Pattern schema with zod, plus 3 example patterns in `/patterns`.
- Bullet pool, emitters (`ring`, `spread`, `spiral`), fixed-timestep loop, collisions.
- Canvas renderer with placeholders.
- A minimal demo in `game`: a player that moves (arrow keys, `Shift` for focus with visible hitbox) and dodges a pattern loaded from JSON, plus an FPS and bullet counter.
- Done when: the demo runs, tests pass, and it handles 5,000 bullets smoothly.

**Stage 2 — Editor**
- Sliders for every emitter field, live preview using the engine, multiple emitter layers, JSON export/import with validation errors shown in the UI.

**Stage 3 — Game**
- Boss with 2–3 spell cards loaded from `/patterns`, shooting (`Z`), bombs (`X`), lives, score, pause (`Esc`), win/lose screens.
- Key rebinding: a controls menu (opened from the pause menu) listing every action with its current key. Click an action, press a key, done; it persists in `localStorage`. One key per action. If the key is already bound to another action, the two actions swap keys. Include a "Restore defaults" button. Keep the binding logic in `engine/src/input` (pure, tested) and the storage and UI in `game`.

**Stage 4 — Extras**
- Shareable pattern URLs, example gallery, "Test Play" in the editor, sound effects, GitHub Pages deployment polish, README GIFs.