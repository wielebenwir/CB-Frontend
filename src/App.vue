<template>
  <div ref="rootEl" style="height: 100dvh"></div>
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
