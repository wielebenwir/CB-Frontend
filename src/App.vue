<template>
  <div ref="rootEl" style="height: 100dvh"></div>
</template>

<script lang="ts" setup>
import createLocationSearch from './location-search';
import { ref, watchEffect } from 'vue';
import 'leaflet/dist/leaflet.css';

import configuration from './location-search/fixtures/settings';
const rootEl = ref<HTMLElement>();

watchEffect(() => {
  if (rootEl.value) {
    createLocationSearch(rootEl.value, configuration);
  }
});
</script>
