import camelcaseKeys from 'camelcase-keys';
import { createApp } from 'vue';

import CBLocationSearch from './components/CBLocationSearch.vue';
import type { LocationSearchConfiguration } from './types';

export default function (element: HTMLElement, config: LocationSearchConfiguration) {
  const parsedConfig = camelcaseKeys<LocationSearchConfiguration>(config, {
    deep: true,
  });
  const app = createApp(CBLocationSearch, { config: parsedConfig });
  app.mount(element);
}
