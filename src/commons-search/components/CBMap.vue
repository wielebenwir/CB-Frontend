<template>
  <LMap
    ref="map"
    class="cb-map"
    :use-global-leaflet="useGlobalLeaflet"
    :center="coordinateToLatLngTuple(config.map.center)"
    :zoom="config.map.zoom.start"
    :min-zoom="config.map.zoom.min"
    :max-zoom="config.map.zoom.max"
    @update:center="emit('update:center', $event)"
  >
    <LTileLayer
      :url="config.map.tileServerApi.url"
      :attribution="attribution"
      :min-zoom="config.map.zoom.min"
      :max-zoom="config.map.zoom.max"
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
import { coordinateToLatLngTuple, GeoLocation } from '../geo';
import { Common, CommonLocation, GeoCoordinate, MapConfig, GeocodeConfig } from '../types';
import { makeMapMarkerIcon, MarkerIcon, resolveMarkerIcon, usePointsOfInterest } from './map';
import CBMapMarkerIcon from './CBMapMarkerIcon.vue';

const props = defineProps<{
  config: { map: MapConfig; geocode?: GeocodeConfig };
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
const useGlobalLeaflet = Object.hasOwn(globalThis, 'L');
const attribution = computed(() => {
  let result = props.config.map.tileServerApi.attribution;
  if (props.config.geocode) {
    result += ` | ${props.config.geocode.nominatimSearchApi.attribution}`;
  }
  return result;
});
const points = computed(() => {
  const points = new Set<LatLngTuple>(
    props.commons.map(({ locationId }) => {
      const { coordinates: c } = props.locationMap.get(locationId) as CommonLocation;
      return coordinateToLatLngTuple(c);
    }),
  );
  if (props.userLocation) {
    points.add(coordinateToLatLngTuple(props.userLocation));
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

  // If this map was just initialized then the center was already set through
  // its settings. We don’t need to do anything.
  if (map && !oldMap) return;

  // We want this to:
  //   * re-focus the map if there are points to focus on
  //   * reset the map to its original center if no points are being displayed
  if (points.size > 0) {
    map.fitBounds([...points], {
      maxZoom: props.config.map.zoom.max,
    });
  } else {
    map.setView(coordinateToLatLngTuple(props.config.map.center), props.config.map.zoom.start);
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
