<template>
  <div ref="rootEl" class="tw-overflow-y-scroll">
    <CBLocation
      v-if="selectedLocation"
      :location="selectedLocation"
      :user-location="userLocation"
      class="tw-sticky tw-top-0 tw-z-20 tw-bg-gray-100 tw-border-0 tw-border-b tw-border-solid tw-border-gray-200"
    >
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
        <p class="tw-font-bold tw-m-0">
          {{ t('commonsAtLocation', { commons: t('common', commons.length) }) }}
        </p>
        <button
          type="button"
          class="cb-btn tw-bg-gray-200 tw-p-1"
          @click="emit('deselectLocation')"
        >
          <IconCross />
        </button>
      </div>
    </CBLocation>

    <TransitionGroup
      tag="ol"
      class="cb-common-list tw-relative tw-flex tw-flex-col tw-p-0 tw-m-6 tw-gap-6"
      name="cb-animate-list"
    >
      <li v-for="common in commons" :key="common.id" class="tw-block tw-relative tw-z-10 tw-shadow">
        <CBCommon
          :common="common"
          :location="locationMap.get(common.locationId) as CommonLocation"
          :show-location="!selectedLocation"
          :user-location="userLocation"
          :category-map="categoryMap"
        />
      </li>
      <li v-if="commons.length === 0" role="none" class="tw-block">
        <p class="tw-m-0 tw-text-center cb-text-wrap-balance">
          {{ t('noMatchingItems', { commons: t('common', 0) }) }}
        </p>
      </li>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, ref, watch } from 'vue';
import { useMap } from '../../util';
import { GeoLocation } from '../geo';
import { Common, CommonCategory, CommonLocation } from '../types';
import CBCommon from './CBCommon.vue';
import CBLocation from './CBLocation.vue';
import { IconCross } from '../../icons';

const props = defineProps<{
  categories: CommonCategory[];
  commons: Common[];
  locationMap: Map<CommonLocation['id'], CommonLocation>;
  selectedLocation: CommonLocation | null;
  userLocation: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'deselectLocation'): void;
}>();
const { t } = useI18n();

const rootEl = ref<HTMLElement>();
const categoryMap = useMap(
  computed(() => props.categories),
  'id',
);

watch(
  computed(() => props.commons),
  () => {
    if (rootEl.value instanceof HTMLElement) {
      rootEl.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
);
</script>

<i18n lang="yaml">
en:
  commonsAtLocation: '{commons} at this location'
  noMatchingItems: 'Sorry, but no {commons} match your filter criteria.'

de:
  commonsAtLocation: '{commons} an diesem Standort'
  noMatchingItems: 'Entschuldige, aber keine {commons} entsprechen deinen Filterkriterien.'
</i18n>
