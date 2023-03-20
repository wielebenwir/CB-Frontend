<template>
  <div ref="rootEl"></div>
</template>

<script lang="ts" setup>
import createMap from './map';
import { ref, watchEffect } from 'vue';
import 'leaflet/dist/leaflet.css';

import configuration from './map/fixtures/settings';
const rootEl = ref<HTMLElement>();

watchEffect(() => {
  if (rootEl.value) {
    createMap(rootEl.value, configuration);
  }
});
</script>
