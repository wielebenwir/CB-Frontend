<template>
  <LMap
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
  </LMap>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { LIcon, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { createPoint, getAttribution, getTileServerUrl } from './map';
import { CommonLocation, ParsedCommonsSearchConfiguration } from '../types';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
  locations: CommonLocation[];
}>();

// map config
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));
</script>
