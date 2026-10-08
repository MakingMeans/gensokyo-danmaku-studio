import { defineConfig } from 'vite';

// GitHub Pages serves the game from /<repo>/game/, so the production base must match that subpath.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/gensokyo-danmaku-studio/game/' : '/',
  build: {
    target: 'es2022',
  },
}));
