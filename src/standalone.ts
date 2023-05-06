/**
 * This file is loaded when viewing the CommonsBooking Frontend as a standalone application.
 * Changes to this file have no effect when this project is used as a component library.
 */

import { createI18n } from '@rokoli/vue-tiny-i18n';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App)
  .use(createI18n({ locale: navigator.language }))
  .mount('#app');
