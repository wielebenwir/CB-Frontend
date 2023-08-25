import { createApp } from 'vue';
import { createI18n } from '@rokoli/vue-tiny-i18n';
import '../style.css';
import translations from './translations';

import CommonsSearch from './CommonsSearch.vue';
import type { CommonsSearchAPI, CommonsSearchConfiguration } from './types';
import { API } from './state';

export { default as mergeConfigs } from 'defaults';
export { createAdminAjaxAPI } from './apis/admin-ajax-api';
export { parseLegacyConfig } from './legacy';

export function init(
  element: HTMLElement,
  api: CommonsSearchAPI,
  config: CommonsSearchConfiguration,
) {
  const i18n = createI18n({
    locale: config.i18n.locale,
    fallbackLocales: ['en'],
    messages: config.i18n.messages ? [translations, config.i18n.messages] : [translations],
  });
  const app = createApp(CommonsSearch, { config });
  app.config.performance = import.meta.env.DEV;
  app.use(i18n);
  app.provide(API, api);
  app.mount(element);
  element.classList.add('cb-app');
  return app;
}

// The value of this is replaced at build-time.
export const version = '__CB_FRONTEND_VERSION__' as string;
