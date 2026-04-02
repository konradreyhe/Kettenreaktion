import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: process.env.VITE_BASE_PATH === 'root' ? '/' : (process.env.VITE_BASE_PATH ?? '/Kettenreaktion/'),
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500, // Phaser is ~1479KB, inherent to library
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
