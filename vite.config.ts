import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: {
      entryFileNames: 'assets/app.js',
      chunkFileNames: 'assets/chunk-[name].js',
      assetFileNames: (asset) => asset.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name][extname]'
    } }
  },
  server: { host: '0.0.0.0' }
});
