import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages serves the editor from /<repo>/editor/, so the production base must match that subpath.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/gensokyo-danmaku-studio/editor/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
  },
}));
