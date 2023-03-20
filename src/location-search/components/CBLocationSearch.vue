<template>
  <div v-if="!locationData && !locationDataError">
    <p>Loading location data...</p>
  </div>

  <div v-else-if="locationDataError">
    <p>{{ locationDataError }}</p>
    <p></p>
    <p>
      <button type="button" @click="retryLocationDataAPI">Retry</button>
    </p>
  </div>

  <div v-else-if="locationData" class="location-search">
    <CBItemFilter style="grid-area: filter" />
    <CBItemList style="grid-area: results" />
    <LMap
      ref="map"
      style="aspect-ratio: 1; grid-area: map"
      :center="[config.latStart, config.lonStart]"
      :max-zoom="config.zoomMax"
      :min-zoom="config.zoomMin"
      :use-global-leaflet="useGlobalLeaflet"
      :zoom="config.zoomStart"
    >
      <LTileLayer
        :url="tileServerUrl"
        :attribution="attribution"
        :max-zoom="config.zoomMax"
        :min-zoom="config.zoomMin"
        :detect-retina="true"
      />
      <template v-for="location in locationData.locations" :key="location.id">
        <LMarker :lat-lng="location.coordinates" :name="location.name">
          <LIcon
            v-if="config.customMarkerIcon"
            :icon-url="config.customMarkerIcon.iconUrl"
            :icon-size="createPoint(config.customMarkerIcon.iconSize)"
            :icon-anchor="createPoint(config.customMarkerIcon.iconAnchor)"
          />
        </LMarker>
      </template>
    </LMap>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { LIcon, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';

import { ParsedLocationSearchConfiguration } from '../types';
import { useLocationSearchData } from '../apis';
import { createPoint, getAttribution, getTileServerUrl } from './map';
import { useI18n } from '../locales';
import CBItemFilter from './CBItemFilter.vue';
import CBItemList from './CBItemList.vue';

const props = defineProps<{
  config: ParsedLocationSearchConfiguration;
}>();

// map config
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const map = ref();
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));

// map data
const {
  data: locationData,
  error: locationDataError,
  retry: retryLocationDataAPI,
} = useLocationSearchData(props.config);

// i18n config
const { locale } = useI18n();
watchEffect(() => {
  locale.value = props.config.locale;
});
</script>

<style scoped>
.location-search {
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
  grid-template-areas:
    'filter filter filter'
    'results map map'
    'results map map';
}
</style>
