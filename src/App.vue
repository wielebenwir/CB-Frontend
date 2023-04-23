<template>
  <div ref="rootEl" class="tw-box-border md:tw-p-6 md:tw-h-[100dvh]"></div>
</template>

<script lang="ts" setup>
import createCommonsSearch from './commons-search';
import { ref, watchEffect } from 'vue';
import 'leaflet/dist/leaflet.css';

import configuration from './commons-search/fixtures/settings';
const rootEl = ref<HTMLElement>();

watchEffect(() => {
  if (rootEl.value) {
    createCommonsSearch(rootEl.value, configuration);
  }
});
</script>

<style>
:root {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    Segoe UI Symbol, 'Noto Color Emoji';
  font-feature-settings: normal;
  font-variation-settings: normal;
}

body {
  margin: 0;
}
</style>
