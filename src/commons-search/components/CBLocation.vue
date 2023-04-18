<template>
  <div class="cb-location tw-p-6">
    <slot />
    <div class="tw-flex tw-gap-3">
      <CBLocationIcon />
      <div class="tw-grow">
        <p class="tw-flex">
          <span>{{ location.name }}</span>
          <span
            v-if="distanceToUserLocation"
            class="tw-text-teal-600 tw-font-bold tw-inline-flex tw-pl-1 tw-ml-auto tw-whitespace-nowrap"
          >
            {{ distanceToUserLocation.value.toLocaleString(locale, { maximumFractionDigits: 1 }) }}
            {{ distanceToUserLocation.unit }}
          </span>
        </p>
        <address class="tw-not-italic tw-text-gray-600 tw-mt-1">
          {{ location.address.street }}<br />
          {{ location.address.postalCode }} {{ location.address.city }}
        </address>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n';
import { computed } from 'vue';
import { calculateDistance, GeoLocation } from '../geo';
import { CommonLocation } from '../types';
import CBLocationIcon from './CBLocationIcon.vue';

const props = defineProps<{
  location: CommonLocation;
  userLocation: GeoLocation | null;
}>();
const { locale } = useI18n();

const distanceToUserLocation = computed(() => {
  return props.userLocation
    ? calculateDistance(props.location.coordinates, props.userLocation)
    : null;
});
</script>
