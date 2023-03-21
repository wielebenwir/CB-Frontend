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
    <CBCommonFilter v-model="filter" style="grid-area: filter" :api="api" />
    <CBCommonList style="grid-area: results" :api="api" />
    <CBMap style="grid-area: map" :locations="filteredLocations" :config="config" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import { ParsedLocationSearchConfiguration } from '../types';
import { useLocationSearchAPI } from '../apis';
import { useI18n } from '../locales';
import CBCommonFilter from './CBCommonFilter.vue';
import CBCommonList from './CBCommonList.vue';
import CBMap from './CBMap.vue';
import { CommonFilterSet, useFilteredData } from '../filter';

const props = defineProps<{
  config: ParsedLocationSearchConfiguration;
}>();

// API data
const filter = ref<CommonFilterSet>({
  categories: new Set<number>(),
});
const { api, apiError, retryAPI } = useLocationSearchAPI(props.config);
const { filteredLocations } = useFilteredData(api, filter);

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
  grid-template-areas: 'filter' 'results' 'map';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: min-content 1fr 1fr;
  height: 100%;
}

@media (min-width: 800px) {
  .location-search {
    grid-template-areas: 'filter filter' 'results map';
    grid-template-columns: 320px minmax(0, 1fr);
    grid-template-rows: min-content 1fr;
  }
}
</style>
