import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// NOTE: This config file is executed by Vite/esbuild (not type-checked by the
// app tsconfig). Node imports here are fine — they never reach the game core.
export default defineConfig({
  // Relative base so the built app also works from a file:// origin, which is
  // what a future Electron renderer will load.
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true,
  },
});
