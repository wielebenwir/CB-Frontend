<template>
  <LMap
    class="cb-map"
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
      <LMarker
        :lat-lng="location.coordinates"
        :name="location.name"
        @click="emit('select', location)"
      >
        <LIcon
          :icon-url="markerIcon.iconUrl"
          :icon-retina-url="markerIcon.iconUrl"
          :icon-size="markerIcon.iconSize"
          :icon-anchor="markerIcon.iconAnchor"
          class-name="cb-map-marker"
        />
      </LMarker>
    </template>
    <LMarker v-if="userLocation" :lat-lng="userLocation" :name="userLocation.name">
      <LIcon
        :icon-url="markerIcon.iconUrl"
        :icon-retina-url="markerIcon.iconUrl"
        :icon-size="markerIcon.iconSize"
        :icon-anchor="markerIcon.iconAnchor"
        class-name="cb-map-marker cb-map-marker--user"
      />
    </LMarker>
  </LMap>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from 'vue';
import { LIcon, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { getAttribution, getTileServerUrl } from './map';
import { CommonLocation, ParsedCommonsSearchConfiguration } from '../types';
import { GeoLocation } from '../geo';
import marker from '../../assets/map-marker-2.svg';

type MarkerIcon = {
  iconUrl: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
};

const defaultIcon: MarkerIcon = {
  iconUrl: marker,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
};

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
  locations: CommonLocation[];
  userLocation: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'select', location: CommonLocation): void;
}>();

const map = ref();
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));
const markerIcon = computed<MarkerIcon>(
  () => (props.config.customMarkerIcon as MarkerIcon) ?? defaultIcon,
);

watchEffect(async () => {
  if (props.userLocation && map.value?.leafletObject?.setView) {
    // Leaflet repeatedly moved to the wrong location if we didn’t
    // wait for the nextTick. It’s unclear why.
    await nextTick();
    // Set focus on user location once it has been set.
    map.value.leafletObject?.setView?.(props.userLocation, Math.min(15, props.config.zoomMax));
  }
});
</script>

<style>
.cb-map-marker {
  filter: drop-shadow(0px 13px 8px rgba(0, 0, 0, 0.2)) hue-rotate(var(--cb-marker-icon-hue, 0deg))
    brightness(var(--cb-marker-icon-brightness, 1));
}

.cb-map-marker.cb-map-marker--user {
  --cb-marker-icon-hue: 120deg;
  --cb-marker-icon-brightness: 1.2;
}
</style>
