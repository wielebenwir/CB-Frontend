<template>
  <div
    class="cb-layout-map-with-auto-sidebar tw-flex tw-flex-col md:tw-flex-row tw-min-h-[min(600px,60dvh)] md:tw-h-[400px] tw-rounded tw-overflow-hidden"
  >
    <CBMap
      v-if="config.map !== undefined"
      ref="map"
      v-model:center="filter.mapCenter"
      class="tw-z-0 tw-w-full md:tw-flex-1 md:tw-order-2"
      :class="{
        'tw-h-48 tw-flex-none md:tw-h-full': filter.location,
        'tw-h-full tw-flex-1': !filter.location,
      }"
      :commons="filteredCommons"
      :location-map="locationMap"
      :user-location="filter.userLocation"
      :config="{ map: config.map, geocode: config.geocode }"
      @select="filter.location = $event"
    />

    <CBCommonList
      v-if="filter.location"
      class="tw-z-10 tw-bg-base-1 md:tw-max-w-sm md:tw-order-1"
      :categories="api.categories"
      :commons="filteredAndSortedCommons"
      :location-map="locationMap"
      :selected-location="filter.location"
      :user-location="filter.userLocation"
      :page-size="10"
      @deselect-location="filter.location = null"
    />
  </div>
</template>

<script lang="ts">
import { LoadingState } from '../types';
export const REQUIRED_STATE: LoadingState[] = [
  'categories',
  'categoryGroups',
  'commons',
  'locations',
];
</script>

<script lang="ts" setup>
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBCommonList from '../components/CBCommonList.vue';
import CBMap from '../components/CBMap.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();

const { filter, filteredCommons, filteredAndSortedCommons, locationMap } = useGlobalState();
</script>
