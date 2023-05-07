<template>
  <div class="cb-common tw-rounded tw-overflow-hidden tw-bg-base-0 tw-group">
    <figure ref="imgContainerEl" class="cb-common-header tw-relative tw-aspect-video tw-m-0">
      <img
        v-if="image"
        :loading="lazy ? 'lazy' : undefined"
        class="cb-common-image tw-block tw-object-cover tw-object-center tw-bg-gray-700 tw-w-full tw-h-full"
        :src="image.url"
        :width="image.width"
        :height="image.height"
        :alt="image.description ?? ''"
      />
      <div v-else class="cb-common-image cb-common-image--fallback tw-h-full tw-bg-gray-700" />
      <figcaption
        class="cb-common-title tw-absolute tw-inset-0 tw-px-4 tw-py-2 tw-m-0 tw-w-full tw-flex tw-flex-col tw-bg-gradient-to-b tw-from-transparent tw-from-20% tw-to-black/75"
      >
        <span
          class="tw-text-xl md:tw-text-2xl tw-font-bold tw-line-clamp-2 tw-text-white tw-block tw-mt-auto cb-text-wrap-balance"
          style="text-shadow: 0 1px rgba(0, 0, 0, 0.5)"
        >
          {{ common.name }}
        </span>
      </figcaption>
    </figure>
    <div class="cb-common-body tw-p-4 tw-flex tw-flex-col tw-gap-2">
      <p v-if="showLocation" class="cb-common-location tw-flex tw-items-start tw-m-0">
        <span class="tw-cb-flex-center">
          <span class="tw-sr-only">{{ t('location', { common: common.name }) }}</span>
          <IconMapMarker class="tw-mt-[0.1em] tw-mr-[.1em] tw-flex-none" role="presentation" />
          <span class="cb-common-location-name cb-text-wrap-balance">{{ location.name }}</span>
        </span>
        <span
          v-if="distanceToUserLocation"
          class="cb-common-location-distance tw-text-teal-600 tw-font-bold tw-inline-flex tw-pl-1 tw-ml-auto tw-whitespace-nowrap"
          :aria-label="
            t('distance', { common: common.name, distance: formattedDistanceToUserLocation })
          "
        >
          {{ formattedDistanceToUserLocation }}
        </span>
      </p>

      <CBSevenDayAvailability
        class="cb-common-availabilities tw-grayscale group-hover:tw-grayscale-0"
        :availabilities="common.availabilities"
        :aria-label="t('availability', { common: common.name })"
      />

      <p v-if="common.description" class="cb-common-description tw-text-gray-600 tw-my-2">
        {{ common.description }}
      </p>
      <ul
        v-if="commonCategories.length > 0"
        class="cb-common-categories tw-flex tw-flex-wrap tw-gap-1 tw-text-gray-600 tw-m-0 tw-p-0"
        :aria-label="t('features', { common: common.name })"
      >
        <li v-for="category in commonCategories" :key="category.id" class="tw-block tw-m-0 tw-p-0">
          <CBBadge v-if="category" class="tw-bg-base-1 tw-text-sm">
            {{ category.name }}
          </CBBadge>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, ref } from 'vue';
import { IconMapMarker } from '../../icons';
import { useImage } from '../../util';
import { Common, CommonCategory, CommonLocation, IdMap } from '../types';
import { GeoLocation, calculateDistance } from '../geo';
import CBBadge from './CBBadge.vue';
import CBSevenDayAvailability from './CBSevenDayAvailability.vue';

const props = defineProps<{
  common: Common;
  location: CommonLocation;
  showLocation: boolean;
  userLocation: GeoLocation | null;
  categoryMap: IdMap<CommonCategory>;
  lazy?: boolean;
}>();
const { locale, t } = useI18n();

const imgContainerEl = ref();
const distanceToUserLocation = computed(() => {
  return props.userLocation
    ? calculateDistance(props.location.coordinates, props.userLocation)
    : null;
});
const formattedDistanceToUserLocation = computed(() => {
  if (distanceToUserLocation.value !== null) {
    const { value, unit } = distanceToUserLocation.value;
    const distance = value.toLocaleString(locale.value, { maximumFractionDigits: 1 });
    return `${distance} ${unit}`;
  } else {
    return '';
  }
});
const commonCategories = computed(() =>
  props.common.categoryIds.map((id) => props.categoryMap.get(id)),
);
const image = useImage(
  imgContainerEl,
  computed(() => props.common.images),
);
</script>

<i18n lang="yaml">
en:
  features: '{common} has the following features'
  availability: 'Availability of {common} in the next seven days'
  distance: '{common} is {distance} away from your current location.'
  location: 'You’ll find {common} at'

de:
  features: '{common} hat die folgenden Eigenschaften'
  availability: 'Verfügbarkeit von {common} in den nächsten sieben Tagen'
  distance: '{common} ist {distance} von deiner jetzigen Position entfernt.'
  location: 'Du findest {common} bei'
</i18n>
