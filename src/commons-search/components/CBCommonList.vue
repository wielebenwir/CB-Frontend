<template>
  <div ref="rootEl" class="tw-overflow-y-scroll">
    <CBLocation
      v-if="selectedLocation"
      :location="selectedLocation"
      :user-location="userLocation"
      class="tw-sticky tw-top-0 tw-bg-gray-100 tw-z-10 tw-border-b tw-border-gray-200"
    >
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
        <p class="tw-font-bold">{{ t('commonsAtLocation') }}</p>
        <button
          type="button"
          class="cb-button tw-bg-gray-200 tw-p-1"
          @click="emit('deselectLocation')"
        >
          <img src="../../assets/cross.svg" alt="" />
        </button>
      </div>
    </CBLocation>

    <TransitionGroup
      tag="ol"
      class="cb-common-list tw-relative tw-flex tw-flex-col tw-m-6 tw-gap-6"
      name="cb-animate-list"
    >
      <li v-for="common in commons" :key="common.id" class="tw-shadow tw-relative tw-z-10">
        <CBCommon
          :common="common"
          :location="locationMap.get(common.locationId) as CommonLocation"
          :show-location="!selectedLocation"
          :user-location="userLocation"
          :category-map="categoryMap"
        />
      </li>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n';
import { ref, toRefs, watch } from 'vue';
import { useMap } from '../../util';
import { GeoLocation } from '../geo';
import { Common, CommonCategory, CommonLocation } from '../types';
import CBCommon from './CBCommon.vue';
import CBLocation from './CBLocation.vue';

const props = defineProps<{
  categories: CommonCategory[];
  commons: Common[];
  locations: CommonLocation[];
  selectedLocation: CommonLocation | null;
  userLocation: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'deselectLocation'): void;
}>();
const { t } = useI18n();

const { categories, locations } = toRefs(props);
const locationMap = useMap(locations, 'id');
const categoryMap = useMap(categories, 'id');
const rootEl = ref<HTMLElement>();

watch(locations, () => {
  if (rootEl.value instanceof HTMLElement) {
    rootEl.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
</script>

<i18n lang="yaml">
en:
  commonsAtLocation: 'Commons at this location'

de:
  commonsAtLocation: 'Commons an diesem Standort'
</i18n>
