import camelcaseKeys from 'camelcase-keys';
import { createApp } from 'vue';

import CBMap from './components/CBMap.vue';
import type { MapConfiguration } from './types';

export default function (element: HTMLElement, config: MapConfiguration) {
  const parsedConfig = camelcaseKeys<MapConfiguration>(config, {
    deep: true,
  });
  const app = createApp(CBMap, { config: parsedConfig });
  app.mount(element);
}
