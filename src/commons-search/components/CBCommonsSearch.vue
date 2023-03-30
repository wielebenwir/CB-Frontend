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

  <div v-else-if="api" class="cb-commons-search">
    <CBCommonFilter
      v-model="filter"
      class="tw-isolate tw-z-10"
      style="grid-area: filter"
      :api="api"
      :config="config"
    />
    <CBCommonList style="grid-area: results" :api="api" />
    <CBMap
      class="tw-isolate tw-z-0"
      style="grid-area: map"
      :locations="filteredLocations"
      :user-location="filter.userLocation"
      :config="config"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import { ParsedCommonsSearchConfiguration } from '../types';
import { useCommonsSearchAPI } from '../apis';
import { useI18n } from '../locales';
import CBCommonFilter from './CBCommonFilter.vue';
import CBCommonList from './CBCommonList.vue';
import CBMap from './CBMap.vue';
import { CommonFilterSet, useFilteredData } from '../filter';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
}>();

// API data
const filter = ref<CommonFilterSet>({
  categories: new Set<number>(),
  userLocation: null,
});
const { api, apiError, retryAPI } = useCommonsSearchAPI(props.config);
const { filteredLocations } = useFilteredData(api, filter);

// i18n config
const { locale } = useI18n();
watchEffect(() => {
  locale.value = props.config.locale;
});
</script>

<style scoped>
.cb-commons-search {
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
  .cb-commons-search {
    grid-template-areas: 'filter filter' 'results map';
    grid-template-columns: 320px minmax(0, 1fr);
    grid-template-rows: min-content 1fr;
  }
}
</style>
