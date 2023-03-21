import camelcaseKeys from 'camelcase-keys';
import { createApp } from 'vue';

import CBCommonsSearch from './components/CBCommonsSearch.vue';
import type { CommonsSearchConfiguration } from './types';

export default function (element: HTMLElement, config: CommonsSearchConfiguration) {
  const parsedConfig = camelcaseKeys<CommonsSearchConfiguration>(config, {
    deep: true,
  });
  const app = createApp(CBCommonsSearch, { config: parsedConfig });
  app.mount(element);
}
