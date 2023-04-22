<template>
  <LIcon
    :icon-url="icon.iconUrl"
    :icon-retina-url="icon.iconUrl"
    :icon-size="icon.iconSize"
    :icon-anchor="icon.iconAnchor"
    :class-name="`cb-map-marker cb-map-marker--user ${icon.className}`"
  />
</template>
<script lang="ts" setup>
import { LIcon } from '@vue-leaflet/vue-leaflet';
import { MarkerIcon } from './map';

defineProps<{
  icon: MarkerIcon;
}>();
</script>
