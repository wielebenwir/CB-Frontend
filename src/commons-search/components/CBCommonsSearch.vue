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

  <div v-else-if="api" class="cb-app cb-commons-search md:tw-rounded tw-overflow-hidden">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-flex-none tw-bg-base-1"
      :api="api"
      :config="config"
      :expanded="config?.layout?.expandFilter"
      :availability-range="availabilityRange"
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
      class="tw-isolate tw-z-0"
      style="grid-area: map"
      :commons="filteredCommons"
      :location-map="locationMap"
      :user-location="filter.userLocation"
      :config="{ map: config.map, geocode: config.geocode }"
      @select="filter.location = $event"
    />
    <div class="tw-isolate tw-z-0 tw-mt-6" style="grid-area: availability">
      <CBAvailabilityCalendar :commons="filteredAndSortedCommons" :location-map="locationMap" />
    </div>

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

import IconArrowUp from '../../assets/arrow-up.svg?component';
import { CommonsSearchAPI, CommonsSearchConfiguration, Id } from '../types';
import { useCommonsSearchAPI } from '../apis';
import CBCommonFilter from './CBCommonFilter.vue';
import CBCommonList from './CBCommonList.vue';
import CBMap from './CBMap.vue';
import { CommonFilterSet, useFilteredData } from '../filter';
import CBAvailabilityCalendar from './CBAvailabilityCalendar.vue';
import { getCoordinates, getCoordinatesCenter } from '../geo';

const props = defineProps<{
  api: CommonsSearchAPI;
  config: CommonsSearchConfiguration;
}>();

const filter = ref<CommonFilterSet>(getFreshFilterData());
const { api, apiError, retryAPI } = useCommonsSearchAPI(props.api);
const { filteredCommons, filteredAndSortedCommons, locationMap } = useFilteredData(api, filter);
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

function getFreshFilterData() {
  return {
    categories: new Set<Id>(),
    userLocation: null,
    location: null,
    mapCenter: null,
    availableToday: false,
    availableBetween: { start: null, end: null },
  };
}

function resetFilters() {
  filter.value = getFreshFilterData();
}

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
  grid-template-areas: 'map' 'filter' 'list' 'availability';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 33dvh) min-content minmax(0, 2fr) auto;
  height: 100%;
}

@media (min-width: 800px) {
  .cb-commons-search {
    grid-template-areas: 'filter map' 'list map' 'availability availability';
    grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
    grid-template-rows: min-content minmax(0, 80dvh) auto;
  }
}
</style>
