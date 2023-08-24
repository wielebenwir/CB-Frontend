<template>
  <div ref="containerEl" class="cb-map">
    <div ref="mapEl" />
  </div>
</template>

<script lang="ts" setup>
import haversine from 'haversine-distance';
import type {
  Map as MapType,
  TileLayer as TileLayerType,
  Marker as MarkerType,
  Icon as IconType,
  MarkerClusterGroup as MarkerClusterGroupType,
  LatLngTuple,
} from 'leaflet';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue';
import { computedAsync, useResizeObserver } from '@vueuse/core';
import { coordinateToLatLngTuple, GeoLocation, getCoordinates } from '../geo';
import { Common, CommonLocation, GeoCoordinate, MapConfig, GeocodeConfig, Id } from '../types';
import {
  makeMapMarkerIcon,
  MarkerIcon,
  resolveClusterMarkerIcon,
  resolveMarkerIcon,
  usePointsOfInterest,
} from './map';

const props = defineProps<{
  config: { map: MapConfig; geocode?: GeocodeConfig };
  commons: Common[];
  locationMap: Map<CommonLocation['id'], CommonLocation>;
  userLocation: GeoLocation | null;
  center: null | GeoCoordinate;
}>();
const emit = defineEmits<{
  (e: 'select', location: CommonLocation): void;
  (e: 'update:center', value: GeoCoordinate): void;
}>();

const containerEl = ref<HTMLElement>();
const mapEl = ref<HTMLElement>();
const map = shallowRef<MapType>();
const tileLayer = shallowRef<TileLayerType>();
const commonMarkersLayer = shallowRef<MarkerClusterGroupType>();
const commonMarkers = shallowRef(new Map<Id, MarkerType>());
const userMarker = shallowRef<MarkerType | undefined>();
const attribution = computed(() => {
  let result = props.config.map.tileServerApi.attribution;
  if (props.config.geocode) {
    result += ` | ${props.config.geocode.nominatimSearchApi.attribution}`;
  }
  return result;
});
const points = computed(() => getCoordinates(props.commons, props.locationMap, props.userLocation));
const pointsOfInterest = usePointsOfInterest(
  computed(() => props.commons),
  computed(() => props.locationMap),
  { onSet: addCommonMarker, onDelete: removeCommonMarker },
  props.config?.map?.markerIcon,
);
const defaultUserMarkerIcon = makeMapMarkerIcon(undefined, ['color'], {
  embedFill: 'var(--cb-map-marker-user-embed-fill)',
});
const userMarkerIcon = computedAsync<MarkerIcon>(
  () => resolveMarkerIcon(props.config?.map?.userMarkerIcon, defaultUserMarkerIcon),
  defaultUserMarkerIcon,
);

function createIcon(markerIcon: MarkerIcon, ...types: string[]): IconType {
  const { Icon } = globalThis.L;
  const markerTypes = types.map((type) => `cb-map-marker--${type}`).join(' ');
  return new Icon({
    ...markerIcon,
    iconRetinaUrl: markerIcon.iconUrl,
    className: `cb-map-marker ${markerTypes} ${markerIcon.className}`,
  });
}

function addCommonMarker(id: Id) {
  if (commonMarkers.value.has(id)) {
    // cleanup existing marker for this id
    removeCommonMarker(id);
  }
  const { Marker } = globalThis.L;
  const poi = pointsOfInterest.value.get(id);
  if (!poi) return;
  const marker = new Marker(poi.location.coordinates, {
    title: poi.common.name,
    icon: createIcon(poi.markerIcon),
  });
  marker.on('click', () => {
    emit('select', poi.location);
  });
  marker.on('keyup', ({ originalEvent: event }: { originalEvent: KeyboardEvent }) => {
    if (event.key === 'Enter') {
      emit('select', poi.location);
    }
  });
  commonMarkers.value.set(id, marker);
  renderCommonMarker(marker);
}

function renderCommonMarker(marker: MarkerType) {
  if (commonMarkersLayer.value) {
    commonMarkersLayer.value.addLayer(marker);
  } else if (map.value) {
    marker.addTo(map.value);
  }
}

function removeCommonMarker(id: Id) {
  const marker = commonMarkers.value.get(id);
  if (!marker) return;
  commonMarkers.value.delete(id);
  marker.clearAllEventListeners();
  marker.remove();
  commonMarkersLayer.value?.removeLayer(marker);
}

function setBounds(points: LatLngTuple[]) {
  if (!map.value) return;

  // We want this to:
  //   * re-focus the map if there are points to focus on
  //   * reset the map to its original center if no points are being displayed
  if (points.length > 0) {
    map.value.fitBounds([...points], {
      maxZoom: props.config.map.zoom.max,
    });
  } else {
    map.value.setView(
      coordinateToLatLngTuple(props.config.map.center),
      props.config.map.zoom.start,
    );
  }
}

onMounted(() => {
  const { MarkerClusterGroup, Map, TileLayer } = globalThis.L;
  const _map = new Map(mapEl.value as HTMLElement, {
    center: coordinateToLatLngTuple(props.config.map.center),
    zoom: props.config.map.zoom.start,
    minZoom: props.config.map.zoom.min,
    maxZoom: props.config.map.zoom.max,
  });
  const _tileLayer = new TileLayer(props.config.map.tileServerApi.url, {
    attribution: attribution.value,
    minZoom: props.config.map.zoom.min,
    maxZoom: props.config.map.zoom.max,
    detectRetina: true,
  });
  _tileLayer.addTo(_map);

  const maxClusterRadius = props.config.map.cluster?.radiusPixels;
  // if the cluster radius is undefined or zero clustering should be disabled
  if (maxClusterRadius) {
    const _commonMarkersLayer = new MarkerClusterGroup({
      maxClusterRadius,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction(cluster) {
        return createIcon(resolveClusterMarkerIcon(props.config.map.cluster?.markerIcon, cluster));
      },
    });
    _commonMarkersLayer.addTo(_map);
    commonMarkersLayer.value = _commonMarkersLayer;
  }

  for (const marker of commonMarkers.value.values()) {
    renderCommonMarker(marker);
  }

  // cspell:disable-next-line
  _map.on('moveend', () => {
    // We only want to update the map center if it is a meaningful change to the
    // value that is already set. This is because this event handler may run
    // after the number of points on the map has changed and fitBounds has
    // been called. In these cases it’s likely that the pre-calculated map center
    // (see CBCommonsSearch.vue) is close enough to the center reported by the map
    // and emitting a new value for it would not have a meaningful impact on the
    // sort order of the data, but it would trigger a costly render-cycle nonetheless.
    if (!props.center || haversine(props.center, _map.getCenter()) > 75) {
      emit('update:center', _map.getCenter());
    }
  });
  map.value = _map;
  tileLayer.value = _tileLayer;
});

onBeforeUnmount(() => {
  for (const id of commonMarkers.value.keys()) {
    removeCommonMarker(id);
  }
  commonMarkersLayer.value?.clearAllEventListeners();
  commonMarkersLayer.value?.clearLayers();
  commonMarkersLayer.value?.remove();
  commonMarkersLayer.value = undefined;
  tileLayer.value?.clearAllEventListeners();
  tileLayer.value?.remove();
  tileLayer.value = undefined;
  map.value?.clearAllEventListeners();
  map.value?.remove();
  map.value = undefined;
});

watchEffect(() => {
  if (map.value) {
    if (userMarker.value && !props.userLocation) {
      userMarker.value.remove();
      userMarker.value = undefined;
    } else if (props.userLocation && !userMarker.value) {
      const { Marker } = globalThis.L;
      const marker = new Marker(props.userLocation, {
        title: props.userLocation.name,
        icon: createIcon(userMarkerIcon.value, 'user'),
      });
      marker.addTo(map.value as MapType);
      userMarker.value = marker;
    } else if (props.userLocation && userMarker.value) {
      userMarker.value.setLatLng(props.userLocation);
      userMarker.value.setIcon(createIcon(userMarkerIcon.value, 'user'));
    }
  }
});

useResizeObserver(containerEl, () => {
  requestAnimationFrame(() => {
    const _containerEl = containerEl.value;
    const _mapEl = mapEl.value;
    const _map = map.value;
    if (_containerEl && _mapEl && _map) {
      const { height } = _containerEl.getBoundingClientRect();
      _mapEl.style.height = `${height}px`;
      _map.invalidateSize();
      setBounds(points.value);
    }
  });
});

// TypeScript is very unhappy if we remove the second parameter (_),
// prettier wants to delete it, if we use a comma (which is reasonable),
// and eslint doesn’t want unused variables. Oh, well…
// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch([map, points], async ([map, points], [oldMap, _]) => {
  // Can’t do anything without a map.
  if (!map) return;

  // If this map was just initialized then the center was already set through
  // its settings. We don’t need to do anything.
  if (map && !oldMap) return;

  setBounds(points);
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
