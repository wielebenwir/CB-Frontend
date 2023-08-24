<template>
  <CBLoadingOverlay
    class="cb-layout-availability-calendar"
    :require-state="['commons', 'locations']"
  >
    <CBAvailabilityCalendar :commons="filteredCommons" :location-map="locationMap" />
  </CBLoadingOverlay>
</template>

<script lang="ts" setup>
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBAvailabilityCalendar from '../components/CBAvailabilityCalendar.vue';
import CBLoadingOverlay from '@/commons-search/components/CBLoadingOverlay.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();

const { filteredCommons, locationMap } = useGlobalState();
</script>
