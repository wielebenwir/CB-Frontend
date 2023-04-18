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

  <div v-else-if="api" class="cb-commons-search md:tw-rounded tw-overflow-hidden">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-flex-none tw-bg-gray-100"
      :api="api"
      :config="config"
      :expanded="config?.layout?.expandFilter"
      :availability-range="{
        start: parseISO(config.filterAvailability.dateMin),
        end: parseISO(config.filterAvailability.dateMax),
      }"
      style="grid-area: filter"
    />
    <CBCommonList
      class="tw-isolate tw-z-10 tw-bg-gray-100"
      style="grid-area: list"
      :categories="api.categories"
      :commons="filteredCommons"
      :locations="filteredLocations"
      :selected-location="filter.location"
      :user-location="filter.userLocation"
      @deselect-location="filter.location = null"
    />
    <CBMap
      class="tw-isolate tw-z-0"
      style="grid-area: map"
      :locations="filteredLocations"
      :user-location="filter.userLocation"
      :config="config"
      @select="filter.location = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { parseISO } from 'date-fns';
import { useI18n } from 'petite-vue-i18n';
import { ref, watchEffect } from 'vue';

import { ParsedCommonsSearchConfiguration } from '../types';
import { useCommonsSearchAPI } from '../apis';
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
  location: null,
  availableToday: false,
  availableBetween: { start: null, end: null },
});
const { api, apiError, retryAPI } = useCommonsSearchAPI(props.config);
const { filteredLocations, filteredCommons } = useFilteredData(api, filter);

// i18n config
const { locale } = useI18n();
watchEffect(() => {
  locale.value = props.config.locale;
});
</script>

<style scoped>
.cb-commons-search {
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'map' 'filter' 'list';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) min-content minmax(0, 2fr);
  height: 100%;
}

@media (min-width: 800px) {
  .cb-commons-search {
    grid-template-areas: 'filter map' 'list map';
    grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
    grid-template-rows: min-content minmax(0, 1fr);
  }
}
</style>
