import replace from '@rollup/plugin-replace';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

import viteBaseConfig, { resolvePath } from './vite.base-config';
import pkg from './package.json';

const NAME = 'commons-search';
const NAME_CAMELCASE = 'CommonsSearch';

export default defineConfig({
  ...viteBaseConfig,
  plugins: [
    ...viteBaseConfig.plugins,
    replace({
      // Some libraries seem to rely on an environment where the NodeJS
      // process.env variable is defined.
      'process.env.NODE_ENV': JSON.stringify('production'),
      // vue-leaflet is adamant about loading these assets,
      // so we replace them with local copies.
      'leaflet/dist/images/marker-icon-2x.png': '@/assets/map-marker-2.svg',
      'leaflet/dist/images/marker-icon.png': '@/assets/map-marker-2.svg',
      'leaflet/dist/images/marker-shadow.png': '@/assets/transparent.gif',
      // custom code
      __CB_FRONTEND_VERSION__: pkg.version,
      preventAssignment: true,
    }),
    visualizer({
      filename: resolvePath('stats', `stats.lib.${NAME}.html`),
    }),
  ],
  build: {
    lib: {
      entry: resolvePath('src', NAME, 'index.ts'),
      name: NAME_CAMELCASE,
      fileName: NAME,
      formats: ['umd', 'es'],
    },
    manifest: true,
    sourcemap: true,
    outDir: resolvePath('dist', 'lib', NAME),
    rollupOptions: {
      external(id) {
        if (id === 'vue') {
          return true;
        }
        // noinspection RedundantIfStatementJS
        if (id.includes('node_modules/leaflet/')) {
          return true;
        }
        return false;
      },
      output: {
        globals: {
          vue: 'Vue',
          leaflet: 'L',
        },
      },
    },
  },
});
