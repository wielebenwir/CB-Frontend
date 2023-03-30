<template>
  <div ref="rootEl" class="md:tw-p-6" style="height: 100dvh"></div>
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
