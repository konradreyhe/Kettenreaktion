import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: process.env.VITE_BASE_PATH === 'root' ? '/' : (process.env.VITE_BASE_PATH ?? '/Kettenreaktion/'),
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'assets', dest: '' }],
    }),
  ],
});
