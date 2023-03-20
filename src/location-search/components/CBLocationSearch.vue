<template>
  <div v-if="!api && !apiError">
    <p>Loading location data...</p>
  </div>

  <div v-else-if="apiError">
    <p>{{ apiError }}</p>
    <p></p>
    <p>
      <button type="button" @click="retryAPI">Retry</button>
    </p>
  </div>

  <div v-else-if="api" class="location-search">
    <CBItemFilter style="grid-area: filter" />
    <CBItemList style="grid-area: results" />
    <CBMap style="grid-area: map" :api="api" :config="config" />
  </div>
</template>

<script lang="ts" setup>
import { watchEffect } from 'vue';

import { ParsedLocationSearchConfiguration } from '../types';
import { useLocationSearchAPI } from '../apis';
import { useI18n } from '../locales';
import CBItemFilter from './CBItemFilter.vue';
import CBItemList from './CBItemList.vue';
import CBMap from './CBMap.vue';

const props = defineProps<{
  config: ParsedLocationSearchConfiguration;
}>();

// map data
const { api, apiError, retryAPI } = useLocationSearchAPI(props.config);

// i18n config
const { locale } = useI18n();
watchEffect(() => {
  locale.value = props.config.locale;
});
</script>

<style scoped>
.location-search {
  box-sizing: border-box;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
  grid-template-areas: 'filter' 'map' 'results';
  grid-template-columns: 1fr;
  grid-template-rows: 100px 1fr 1fr;
  height: 100%;
}

@media (min-width: 800px) {
  .location-search {
    grid-template-areas: 'filter filter' 'results map';
    grid-template-columns: minmax(320px, max-content) 1fr;
    grid-template-rows: 100px 1fr;
  }
}
</style>
