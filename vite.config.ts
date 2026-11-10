import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Keep Vite anchored to the directory that contains this config and index.html.
  root: projectRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(projectRoot, 'index.html'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
