import { resolve } from 'path';

// @ts-expect-error this is a bug in vue-tiny-18n
import TinyI18nPlugin from '@rokoli/vue-tiny-i18n/plugin';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';

export function resolvePath(...paths: string[]) {
  return resolve(__dirname, ...paths);
}

export default defineConfig({
  base: '',
  clearScreen: false,
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  plugins: [
    vue(),
    TinyI18nPlugin(),
    svgLoader({
      defaultImport: 'url',
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
    }),
  ],
});
