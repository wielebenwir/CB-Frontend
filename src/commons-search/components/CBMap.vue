<template>
  <LMap
    ref="map"
    class="cb-map"
    :use-global-leaflet="useGlobalLeaflet"
    v-bind="mapSettings"
    @update:center="emit('update:center', $event)"
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
import type { LatLngTuple, Map } from 'leaflet';
import { computed, ref, watchEffect } from 'vue';
import { LIcon, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { defaultIcon, getAttribution, getTileServerUrl, MarkerIcon, useMapSettings } from './map';
import { CommonLocation, GeoCoordinate, ParsedCommonsSearchConfiguration } from '../types';
import { GeoLocation } from '../geo';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
  locations: CommonLocation[];
  userLocation: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'select', location: CommonLocation): void;
  (e: 'update:center', value: GeoCoordinate): void;
}>();

const map = ref();
const leafletMap = computed<Map>(() => map?.value?.leafletObject);
const mapSettings = useMapSettings(computed(() => props.config));
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));
const markerIcon = computed<MarkerIcon>(
  () => (props.config.customMarkerIcon as MarkerIcon) ?? defaultIcon,
);
const bounds = computed(() => {
  const points: LatLngTuple[] = props.locations.map(({ coordinates: c }) => [c.lat, c.lng]);
  if (props.userLocation) {
    const { lat, lng } = props.userLocation;
    points.push([lat, lng]);
  }
  if (points.length === 0) {
    const { latStart, lonStart } = props.config;
    if (typeof latStart === 'number' && typeof lonStart === 'number') {
      points.push([latStart, lonStart]);
    }
  }
  return points;
});

watchEffect(async () => {
  if (leafletMap.value) {
    leafletMap.value.fitBounds(bounds.value, {
      maxZoom: props.config.zoomMax,
    });
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
