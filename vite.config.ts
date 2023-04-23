import { defineConfig } from 'vite';

import appConfig from './vite.cb-app-config';
import libConfig from './vite.cb-lib-config';

const VITE_BUILD_MODE = process.env.VITE_BUILD_MODE ?? 'lib';

if (!['app', 'lib'].includes(VITE_BUILD_MODE)) {
  throw new TypeError(`BUILD_MODE must be either 'app' or 'lib'.`);
}
export default defineConfig(VITE_BUILD_MODE === 'lib' ? libConfig : appConfig);
