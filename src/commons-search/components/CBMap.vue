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
    <template v-if="commons">
      <template
        v-for="[key, { common, location, markerIcon }] in pointsOfInterest.entries()"
        :key="key"
      >
        <LMarker
          :lat-lng="location.coordinates"
          :name="common.name"
          @click="emit('select', location)"
        >
          <CBMapMarkerIcon :icon="markerIcon" />
        </LMarker>
      </template>
    </template>
    <LMarker v-if="userLocation" :lat-lng="userLocation" :name="userLocation.name">
      <CBMapMarkerIcon :icon="userMarkerIcon" />
    </LMarker>
  </LMap>
</template>

<script lang="ts" setup>
import type { LatLngTuple, Map as LeafletMap } from 'leaflet';
import { computed, ref, watch } from 'vue';
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { computedAsync } from '@vueuse/core';
import { GeoLocation } from '../geo';
import { Common, CommonLocation, GeoCoordinate, ParsedCommonsSearchConfiguration } from '../types';
import {
  getAttribution,
  getTileServerUrl,
  makeMapMarkerIcon,
  MarkerIcon,
  resolveMarkerIcon,
  useMapSettings,
  usePointsOfInterest,
} from './map';
import CBMapMarkerIcon from './CBMapMarkerIcon.vue';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
  commons: Common[];
  locationMap: Map<CommonLocation['id'], CommonLocation>;
  userLocation: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'select', location: CommonLocation): void;
  (e: 'update:center', value: GeoCoordinate): void;
}>();

const map = ref();
const leafletMap = computed<LeafletMap>(() => map?.value?.leafletObject);
const mapSettings = useMapSettings(computed(() => props.config));
const useGlobalLeaflet = Object.hasOwn(globalThis, 'Leaflet');
const attribution = computed(() => getAttribution(props.config));
const tileServerUrl = computed(() => getTileServerUrl(props.config.baseMap));
const points = computed(() => {
  const points = new Set<LatLngTuple>(
    props.commons.map(({ locationId }) => {
      const { coordinates: c } = props.locationMap.get(locationId) as CommonLocation;
      return [c.lat, c.lng];
    }),
  );
  if (props.userLocation) {
    const { lat, lng } = props.userLocation;
    points.add([lat, lng]);
  }
  return points;
});
const pointsOfInterest = usePointsOfInterest(
  computed(() => props.commons),
  computed(() => props.locationMap),
  props.config?.map?.markerIcon,
);
const defaultUserMarkerIcon = makeMapMarkerIcon(undefined, ['color'], {
  embedFill: 'var(--commonsbooking-map-marker-user-embed-fill)',
});
const userMarkerIcon = computedAsync<MarkerIcon>(
  () => resolveMarkerIcon(props.config?.map?.userMarkerIcon, defaultUserMarkerIcon),
  defaultUserMarkerIcon,
);

// TypeScript is very unhappy if we remove the second parameter (_),
// prettier wants to delete it, if we use a comma (which is reasonable),
// and eslint doesn’t want unused variables. Oh, well…
// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch([leafletMap, points], async ([map, points], [oldMap, _]) => {
  // Can’t do anything without a map.
  if (!map) return;

  // This map was just initialized and the center was already set through
  // its settings. We don’t need to do anything.
  if (map && !oldMap && mapSettings.value.center) return;

  // We want this to:
  //   * re-focus the map if there are points to focus on
  //   * reset the map to its original center if no points are being displayed
  if (points.size > 0) {
    map.fitBounds([...points], {
      maxZoom: props.config.zoomMax,
    });
  } else if (mapSettings.value.center) {
    map.setView(mapSettings.value.center, mapSettings.value.zoom);
  }
});
</script>

<style>
.cb-map {
  --cb-marker-icon-hue: 0deg;
  --cb-marker-icon-brightness: 1;
}

.cb-map-marker {
  filter: drop-shadow(0px 13px 8px rgba(0, 0, 0, 0.2)) hue-rotate(var(--cb-marker-icon-hue, 0deg))
    brightness(var(--cb-marker-icon-brightness, 1));
}
</style>
