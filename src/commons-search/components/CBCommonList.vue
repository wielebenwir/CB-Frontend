<template>
  <div class="tw-flex tw-flex-col">
    <CBLocation
      v-if="selectedLocation"
      :location="selectedLocation"
      :user-location="userLocation"
      class="tw-sticky tw-top-0 tw-z-20 tw-bg-base-1 tw-border-b tw-border-base-2"
    >
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
        <p class="tw-font-bold tw-m-0">
          {{ t('commonsAtLocation', { commons: t('common', commons.length) }) }}
        </p>
        <button type="button" class="cb-btn tw-bg-base-2 tw-p-1" @click="emit('deselectLocation')">
          <IconCross />
        </button>
      </div>
    </CBLocation>

    <TransitionGroup
      ref="transitionGroup"
      tag="ol"
      class="cb-common-list tw-relative tw-scroll-smooth tw-m-0 tw-p-0 tw-pb-6 tw-scroll-pt-6 tw-overflow-y-scroll tw-h-full"
      name="cb-animate-list"
      :aria-label="t('listOfCommons', { commons: t('common', 0) })"
    >
      <li
        v-for="(common, index) in displayedItems"
        :key="common.id"
        class="tw-block tw-relative tw-z-10 tw-mt-6 tw-mx-6 tw-w-auto"
      >
        <CBCommon
          :common="common"
          :location="locationMap.get(common.locationId) as CommonLocation"
          :show-location="!selectedLocation"
          :user-location="userLocation"
          :category-map="categoryMap"
          :lazy="index > 2"
          class="tw-border tw-border-black/10"
        />
      </li>
      <li v-if="commons.length === 0" class="tw-block tw-mt-6 tw-mx-6">
        <p class="tw-m-0 tw-text-center cb-text-wrap-balance">
          {{ t('noMatchingItems', { commons: t('common', 0) }) }}
        </p>
      </li>
      <li
        v-if="isSmallViewport && commons.length > displayedItems.length"
        class="tw-block tw-mt-6 tw-mx-6"
      >
        <button type="button" class="cb-btn tw-bg-base-2 tw-w-full" @click="loadMoreCommons">
          {{ t('loadMore', { commons: t('common', commons.length) }) }}
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useInfiniteScroll, useMediaQuery } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useMap } from '../../util';
import { IconCross } from '../../icons';
import { GeoLocation } from '../geo';
import { Common, CommonCategory, CommonLocation } from '../types';
import CBCommon from './CBCommon.vue';
import CBLocation from './CBLocation.vue';

const props = defineProps<{
  categories: CommonCategory[];
  commons: Common[];
  locationMap: Map<CommonLocation['id'], CommonLocation>;
  selectedLocation: CommonLocation | null;
  userLocation: GeoLocation | null;
  pageSize: number;
}>();
const emit = defineEmits<{
  (e: 'deselectLocation'): void;
}>();
const { t } = useI18n();

const transitionGroup = ref();
const listEl = computed<HTMLOListElement>(() => transitionGroup.value?.$el);
const categoryMap = useMap(
  computed(() => props.categories),
  'id',
);
const displayedItems = ref(props.commons.slice(0, props.pageSize));
const isSmallViewport = useMediaQuery('(max-width: 799px)');

watch(
  () => props.commons,
  () => {
    requestAnimationFrame(() => {
      listEl.value?.scrollTo({ top: 0, behavior: 'instant' as never });
    });
    displayedItems.value = props.commons.slice(0, props.pageSize);
  },
);

function loadMoreCommons() {
  if (displayedItems.value.length === props.commons.length) return;

  const scrollTop = listEl.value?.scrollTop ?? 0;
  displayedItems.value = props.commons.slice(0, displayedItems.value.length + props.pageSize);
  requestAnimationFrame(() => {
    if (scrollTop) {
      listEl.value?.scrollTo({ top: scrollTop, behavior: 'instant' as never });
    }
  });
}

useInfiniteScroll(
  listEl,
  () => {
    // As we vertically stack components on small viewports we will most likely
    // not have a scrollbar on the list scroller as it can freely expand to its natural height.
    // Loading new commons automatically would make it very tiresome to reach the end
    // of the page if we have a large number of commons.
    if (!isSmallViewport.value) loadMoreCommons();
  },
  {
    direction: 'bottom',
    // roughly three cards
    distance: 900,
    interval: 1000,
  },
);
</script>

<i18n lang="yaml">
en:
  commonsAtLocation: '{commons} at this location'
  noMatchingItems: 'Sorry, but no {commons} match your filter criteria.'
  loadMore: 'Show more {commons}'
  listOfCommons: 'List of {commons}'

de:
  commonsAtLocation: '{commons} an diesem Standort'
  noMatchingItems: 'Entschuldige, aber keine {commons} entsprechen deinen Filterkriterien.'
  loadMore: 'Weitere {commons} anzeigen'
  listOfCommons: 'Liste der {commons}'
</i18n>
