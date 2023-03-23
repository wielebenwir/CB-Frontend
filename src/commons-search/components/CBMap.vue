<template>
  <LMap
    ref="map"
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
    <template v-for="location in locations" :key="location.id">
      <LMarker :lat-lng="location.coordinates" :name="location.name">
        <LIcon
          v-if="config.customMarkerIcon"
          :icon-url="config.customMarkerIcon.iconUrl"
          :icon-size="createPoint(config.customMarkerIcon.iconSize)"
          :icon-anchor="createPoint(config.customMarkerIcon.iconAnchor)"
        />
      </LMarker>
    </template>
    <LMarker v-if="userLocation" :lat-lng="userLocation" :name="userLocation.name" />
  </LMap>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { LIcon, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { createPoint, getAttribution, getTileServerUrl } from './map';
import { CommonLocation, ParsedCommonsSearchConfiguration } from '../types';
import { GeoLocation } from '../geo';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
  locations: CommonLocation[];
  userLocation: GeoLocation | null;
}>();

const map = ref();
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));

watchEffect(() => {
  if (props.userLocation && map.value?.leafletObject?.setView) {
    // Set focus on user location once it has been set.
    map.value.leafletObject?.setView?.(props.userLocation, Math.min(15, props.config.zoomMax));
  }
});
</script>
