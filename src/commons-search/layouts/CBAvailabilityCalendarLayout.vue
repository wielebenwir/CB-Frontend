<template>
  <div class="cb-layout-availability-calendar">
    <CBAvailabilityCalendar :commons="filteredCommons" :location-map="locationMap" />
  </div>
</template>

<script lang="ts" setup>
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBAvailabilityCalendar from '../components/CBAvailabilityCalendar.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();

const { filteredCommons, locationMap } = useGlobalState();
</script>
