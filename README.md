# 🌸 Gensokyo Danmaku Studio

> A Touhou-inspired bullet hell toolkit: a danmaku engine, a visual spell card editor, and a playable boss fight built with it.

**[▶ Play the game](#)** · **[✏️ Open the editor](#)**

<!-- Replace with a GIF of the editor and the game in action -->
![Demo](docs/demo.gif)

---

## ✨ What is this?

Gensokyo Danmaku Studio is three projects that share one core:

| Package | What it does |
|---|---|
| **`engine`** | A lightweight bullet hell engine. It reads bullet patterns from JSON and runs them efficiently, handling movement, collisions, and rendering for thousands of bullets at once. |
| **`editor`** | A web tool for designing spell cards visually. Tweak bullet count, speed, angle, and rotation with sliders and watch the pattern update in real time. Export it as JSON, or jump in and dodge it yourself with **Test Play**. |
| **`game`** | A short, playable boss fight. Every spell card the boss uses was designed in the editor. |

The editor creates the content, and the game consumes it — the same workflow game studios use with their internal tools.

## 🎯 Features

### Engine
- Data-driven bullet patterns defined in JSON
- Object pooling to keep thousands of bullets on screen without frame drops
- Small-hitbox collision detection, faithful to the genre
- Fixed-timestep game loop for consistent behavior across devices

### Editor
- Live preview that updates as you move the sliders
- Layer multiple emitters to build complex patterns
- Export and import patterns as JSON
- Share patterns through a URL
- **Test Play** mode to dodge your own pattern instantly

### Game
- Focus mode (hold `Shift`) to slow down and reveal your hitbox
- Lives, bombs, and score
- A boss with multiple spell cards

## 🧩 Pattern format

Patterns are plain JSON, so you can write them by hand or create them in the editor.

```json
{
  "version": 1,
  "id": "spiral-bloom",
  "name": "Spiral Bloom",
  "duration": 10,
  "emitters": [
    {
      "type": "ring",
      "bullets": 24,
      "speed": 120,
      "spin": 15,
      "interval": 0.2,
      "sprite": "rice-red"
    }
  ]
}
```

Time is in seconds, speed in pixels per second and angles in degrees (0° points right, clockwise is positive). Emitter types: `ring` (bullets evenly spaced around 360°), `spread` (a fan of `spread` degrees, optionally `aimed` at the player) and `spiral` (`streams` rotating arms). Every field is validated with [zod](https://zod.dev) and invalid files produce readable errors such as `emitters[0].speed: Too small: expected number to be >=0`.

## 🛠️ Tech stack

- **TypeScript**
- **HTML5 Canvas** for rendering
- **React** for the editor UI; the game is vanilla TypeScript
- **zod** for the pattern schema
- **Vite** for development and builds
- **pnpm workspaces** for the monorepo
- **Vitest** for testing
- **GitHub Actions** for CI and deployment to GitHub Pages

## 📁 Project structure

```
gensokyo-danmaku-studio/
├── packages/
│   ├── engine/     # Core: bullets, collisions, game loop, pattern parser
│   ├── editor/     # Visual spell card editor
│   └── game/       # Playable boss fight
├── patterns/       # Shared JSON patterns
└── docs/           # Screenshots and GIFs
```

## 🚀 Getting started

Requires **Node 22+** and **pnpm 10** (`npm install -g pnpm`).

```bash
git clone https://github.com/YOUR_USERNAME/gensokyo-danmaku-studio.git
cd gensokyo-danmaku-studio
pnpm install

pnpm dev:editor   # Run the editor
pnpm dev:game     # Run the game
pnpm test         # Run tests
pnpm lint         # Lint
pnpm typecheck    # Type-check every package
pnpm build        # Build everything
```

In the game demo, press `1`–`4` to switch between the patterns in `/patterns` and `R` to restart the current one. The HUD shows FPS and the live bullet count; pattern `4` is a stress test that fills the bullet pool.

In the editor, pick **Load example…** to start from one of the shared patterns, or build one from scratch: add emitter layers, drag the sliders and watch the preview update. Move the mouse over the preview to place the player target that `aimed` emitters shoot at. Invalid values are listed with their JSON path while the preview keeps the last valid pattern. Use **Copy** or **Download** to export, and paste or open a file to import. Your draft is saved in the browser, so a reload does not lose it.

## 🎮 Controls

| Key | Action |
|---|---|
| Arrow keys | Move |
| `Z` | Shoot |
| `X` | Bomb |
| `Shift` | Focus (slow movement, show hitbox) |
| `Esc` | Pause |

## 🗺️ Roadmap

- [ ] **Stage 1 — Engine:** bullets driven by JSON, player movement, collisions
- [ ] **Stage 2 — Editor:** sliders, live preview, JSON export
- [ ] **Stage 3 — Game:** boss with 2–3 spell cards, lives, bombs, score
- [ ] **Stage 4 — Extras:** shareable URLs, example gallery, Test Play, sound effects

## 🎨 Credits

This project uses free community assets. All credit goes to their authors:

- Bullet sprites: [Danmaku Sprite Pack](https://void-dancer.itch.io/danmaku-sprite) by **Void dancer**
- Bullet sprites: [MKII Shot Sheet](https://ryann1908.itch.io/mkii-shot-sheet) by **Ryann1908**
- Character sprites: [Touhou 16x16 Mini Pack](https://reale-ly.itch.io/touhou-mini-pack) by **Majstek**
- Character sprites: [Touhou Pixel Characters](https://code-farmer.itch.io/touhou-pixe-characters) by **code farmer**

## ⚖️ Disclaimer

**This is an unofficial fan work based on Touhou Project.** (東方Project二次創作)

Touhou Project and all its characters belong to **ZUN / Team Shanghai Alice**. This project follows the [Touhou Project Fan Creator Guidelines](https://touhou-project.news/guidelines_en/). It contains no assets extracted from the official games and is not for commercial use.

## 📄 License

The source code is licensed under the [MIT License](LICENSE). Third-party assets keep their original licenses; see their pages linked in [Credits](#-credits).