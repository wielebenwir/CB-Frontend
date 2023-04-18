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
      ref="map"
      class="tw-isolate tw-z-0"
      style="grid-area: map"
      :locations="filteredLocations"
      :user-location="filter.userLocation"
      :config="config"
      @select="filter.location = $event"
    />

    <Transition name="cb-animate-panel">
      <button
        v-if="!isMapVisible"
        class="cb-button tw-bg-gray-900 tw-text-white tw-text-3xl tw-fixed tw-z-10 tw-bottom-3 tw-right-3 tw-shadow-lg tw-aspect-square md:tw-hidden"
        @click="scrollMapIntoView"
      >
        <IconArrowUp class="tw-scale-125" />
      </button>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { parseISO } from 'date-fns';
import { useElementVisibility } from '@vueuse/core';
import { ref } from 'vue';

import IconArrowUp from '../../assets/arrow-up.svg?component';
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

const map = ref();
const isMapVisible = useElementVisibility(map);

function scrollMapIntoView() {
  if (map.value) {
    map.value.$el.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<style scoped>
.cb-commons-search {
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'map' 'filter' 'list';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 33dvh) min-content minmax(0, 2fr);
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
