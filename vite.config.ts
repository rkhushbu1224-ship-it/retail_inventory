import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Vite uses @tailwindcss/vite; an inline object stops it also loading postcss.config.mjs (used by Next.js).
    css: { postcss: {} },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Forward /api calls to the Express backend during local development.
      proxy: {
        '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:47191',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/resources/**', '**/*.db', '**/.git/**'],
      },
    },
  };
});
