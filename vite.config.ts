import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

// NOTE: This config file is executed by Vite/esbuild (not type-checked by the
// app tsconfig). Node imports here are fine — they never reach the game core.
//
// Two build modes:
//   npm run build             → normal multi-file dist/ (for GitHub Pages / any host)
//   npm run build:standalone  → dist-standalone/index.html, everything inlined
//                               into ONE self-contained file that opens with a
//                               plain double-click (works over file://).
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    // Relative base so the build also works from a file:// origin and at a
    // project subpath (e.g. GitHub Pages /happy-burger-shop/).
    base: './',
    plugins: standalone ? [viteSingleFile()] : [],
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
      outDir: standalone ? 'dist-standalone' : 'dist',
      target: 'es2022',
      sourcemap: !standalone,
      emptyOutDir: true,
    },
  };
});
