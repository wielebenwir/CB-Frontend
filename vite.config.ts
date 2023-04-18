import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  clearScreen: false,
  plugins: [vue()],
  define: {
    // TODO: We might want to remove this once this library is in production use.
    __VUE_PROD_DEVTOOLS__: true,
  },
  build: {
    outDir: 'dist-app',
    sourcemap: true,
    emptyOutDir: true,
  },
});
