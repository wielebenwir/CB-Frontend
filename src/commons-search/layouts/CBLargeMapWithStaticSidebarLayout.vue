<template>
  <div class="cb-layout-large-map-with-static-sidebar md:tw-rounded tw-overflow-hidden">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-flex-none tw-bg-base-1 tw-border-b tw-border-base-3"
      :api="api"
      :config="config"
      :availability-range="availabilityRange"
      :can-reset="canResetFilters"
      style="grid-area: filter"
      @reset="resetFilters"
    />
    <CBCommonList
      class="tw-isolate tw-z-10 tw-bg-base-1"
      style="grid-area: list"
      :categories="api.categories"
      :commons="filteredAndSortedCommons"
      :location-map="locationMap"
      :selected-location="filter.location"
      :user-location="filter.userLocation"
      :page-size="10"
      @deselect-location="filter.location = null"
    />
    <CBMap
      v-if="config.map !== undefined"
      ref="map"
      v-model:center="filter.mapCenter"
      class="tw-z-0"
      style="grid-area: map"
      :commons="filteredCommons"
      :location-map="locationMap"
      :user-location="filter.userLocation"
      :config="{ map: config.map, geocode: config.geocode }"
      @select="filter.location = $event"
    />

    <Transition name="cb-animate-panel">
      <button
        v-if="!isMapVisible"
        class="cb-btn tw-bg-base-3 tw-text-3xl tw-fixed tw-z-10 tw-bottom-3 tw-right-3 tw-shadow-lg tw-aspect-square tw-invert md:tw-hidden"
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
import { computed, ref, watch } from 'vue';

import { IconArrowUp } from '../../icons';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import { getCoordinates, getCoordinatesCenter } from '../geo';
import CBCommonFilter from '../components/CBCommonFilter.vue';
import CBCommonList from '../components/CBCommonList.vue';
import CBMap from '../components/CBMap.vue';
import { useGlobalState } from '../state';

const props = defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
const {
  filter,
  canResetFilters,
  resetFilters,
  filteredCommons,
  filteredAndSortedCommons,
  locationMap,
} = useGlobalState();
const availabilityRange = computed(() => ({
  start: parseISO(props.config.filter.availability.dateRange.start),
  end: parseISO(props.config.filter.availability.dateRange.end),
}));
const map = ref();
const isMapVisible = useElementVisibility(map);

watch(filteredCommons, (newCommons) => {
  // We also update the mapCenter through the CBMap component,
  // but we must calculate it as early as possible, so we can avoid multiple sorting runs.
  filter.value.mapCenter = getCoordinatesCenter(
    getCoordinates(newCommons, locationMap.value, filter.value.userLocation),
  );
});
function scrollMapIntoView() {
  if (map.value) {
    map.value.$el.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<style scoped>
.cb-layout-large-map-with-static-sidebar {
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'map' 'filter' 'list' 'availability';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 33dvh) min-content minmax(0, 2fr) auto;
  height: 100%;
}

@media (min-width: 800px) {
  .cb-layout-large-map-with-static-sidebar {
    grid-template-areas: 'filter map' 'list map' 'availability availability';
    grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
    grid-template-rows: min-content minmax(0, 80dvh) auto;
  }
}
</style>
