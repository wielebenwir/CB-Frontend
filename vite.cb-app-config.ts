import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import viteBaseConfig, { resolvePath } from './vite.base-config';

export default defineConfig({
  ...viteBaseConfig,
  plugins: [
    ...viteBaseConfig.plugins,
    visualizer({
      filename: resolvePath('stats', 'stats.app.html'),
    }),
  ],
  define: {
    // This is fine as the app build is not used in production.
    __VUE_PROD_DEVTOOLS__: true,
  },
  build: {
    outDir: resolvePath('dist', 'app'),
    sourcemap: true,
    emptyOutDir: true,
  },
});
