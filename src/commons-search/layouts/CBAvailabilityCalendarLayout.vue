<template>
  <div class="cb-layout-availability-calendar">
    <CBAvailabilityCalendar :commons="filteredCommons" :location-map="locationMap" />
  </div>
</template>

<script lang="ts">
import { LoadingState } from '../types';
export const REQUIRED_STATE: LoadingState[] = ['commons', 'locations'];
</script>

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
