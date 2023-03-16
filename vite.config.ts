import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  plugins: [vue()],
  build: {
    outDir: 'dist-app',
    sourcemap: true,
    emptyOutDir: true,
  },
});
