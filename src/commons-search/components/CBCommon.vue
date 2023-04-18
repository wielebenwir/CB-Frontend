<template>
  <div class="cb-common tw-rounded tw-overflow-hidden tw-bg-white tw-group">
    <figure ref="imgContainerEl" class="cb-common-header tw-relative tw-aspect-video">
      <img
        v-if="image"
        loading="lazy"
        class="cb-common--image tw-object-cover tw-object-center tw-bg-gray-700 tw-w-full tw-h-full"
        :src="image.url"
        :width="image.width"
        :height="image.height"
        :alt="image.description ?? ''"
      />
      <div v-else class="cb-common--image-fallback tw-h-full tw-bg-gray-700" />
      <figcaption
        class="cb-common--title tw-absolute tw-inset-0 tw-px-4 tw-py-2 tw-w-full tw-flex tw-flex-col tw-bg-gradient-to-b tw-from-transparent tw-from-20% tw-to-black/75"
      >
        <span
          class="tw-text-xl md:tw-text-2xl tw-font-bold tw-line-clamp-2 tw-text-white tw-block tw-mt-auto cb-text-wrap-balance"
          style="text-shadow: 0 1px rgba(0, 0, 0, 0.5)"
        >
          {{ common.name }}
        </span>
      </figcaption>
    </figure>
    <div class="cb-common--body tw-p-4 tw-flex tw-flex-col tw-gap-2">
      <p v-if="showLocation" class="cb-common--location tw-flex tw-items-start">
        <img
          src="../../assets/map-marker.svg"
          alt=""
          class="-tw-ml-[.1em] tw-mt-[0.15em] tw-mr-[.1em] tw-flex-none"
          role="presentation"
        />
        <span class="cb-common--location--name cb-text-wrap-balance">{{ location.name }}</span>
        <span
          v-if="distanceToUserLocation"
          class="cb-common--location--distance tw-text-teal-600 tw-font-bold tw-inline-flex tw-pl-1 tw-ml-auto tw-whitespace-nowrap"
        >
          {{ distanceToUserLocation.value.toLocaleString(locale, { maximumFractionDigits: 1 }) }}
          {{ distanceToUserLocation.unit }}
        </span>
      </p>

      <CBSevenDayAvailability
        class="cb-common-availabilities tw-grayscale group-hover:tw-grayscale-0"
        :availabilities="common.availabilities"
      />

      <p v-if="common.description" class="cb-common--description tw-text-gray-600 tw-my-2">
        {{ common.description }}
      </p>
      <div
        v-if="commonCategories.length > 0"
        class="cb-common--categories tw-flex tw-flex-wrap tw-gap-1 tw-text-gray-600"
      >
        <template v-for="category in commonCategories" :key="category.id">
          <CBBadge v-if="category" class="tw-bg-gray-100 tw-text-sm">
            {{ category.name }}
          </CBBadge>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n';
import { computed, ref } from 'vue';
import { useImage } from '../../util';
import { Common, CommonCategory, CommonLocation } from '../types';
import { GeoLocation, calculateDistance } from '../geo';
import CBBadge from './CBBadge.vue';
import CBSevenDayAvailability from './CBSevenDayAvailability.vue';

const props = defineProps<{
  common: Common;
  location: CommonLocation;
  showLocation: boolean;
  userLocation: GeoLocation | null;
  categoryMap: Map<number, CommonCategory>;
}>();
const { locale } = useI18n();

const imgContainerEl = ref();
const distanceToUserLocation = computed(() => {
  return props.userLocation
    ? calculateDistance(props.location.coordinates, props.userLocation)
    : null;
});
const commonCategories = computed(() =>
  props.common.categoryIds.map((id) => props.categoryMap.get(id)),
);
const image = useImage(
  imgContainerEl,
  computed(() => props.common.images),
);
</script>
