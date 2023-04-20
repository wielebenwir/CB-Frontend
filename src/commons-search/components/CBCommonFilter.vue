<template>
  <div
    class="cb-common-filter tw-p-6 tw-relative tw-border-b tw-border-gray-300 tw-flex tw-flex-col tw-gap-3"
  >
    <div class="tw-flex tw-gap-3 tw-max-w-full" :class="{ 'tw-flex-col': expanded }">
      <CBLocationFilter
        v-if="config.showLocationDistanceFilter"
        v-model="userLocationFilter"
        class="tw-min-w-0 tw-flex-1"
        :config="config.geocode"
      />

      <CBCommonFilterPanel :expanded="expanded">
        <CBCategoryRenderGroupList
          v-model="activeCategories"
          :render-group-list="categoryRenderGroups"
          :render-group-meta="categoryRenderGroupsMeta"
        />
        <CBAvailabilityRangeFilter
          v-model="isAvailableBetween"
          :availability-range="availabilityRange"
        />
      </CBCommonFilterPanel>
    </div>

    <CBSwitch v-model="isAvailableToday" :label="t('availableToday')" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVModel } from '@vueuse/core';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryRenderGroupList from './CBCategoryRenderGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import CBSwitch from './CBSwitch.vue';
import CBAvailabilityRangeFilter from './CBAvailabilityRangeFilter.vue';
import CBCommonFilterPanel from './CBCommonFilterPanel.vue';
import { useCategoryRenderGroups } from './categories';

const props = defineProps<{
  api: CommonsSearchAPI;
  config: ParsedCommonsSearchConfiguration;
  categories: CommonFilterSet['categories'];
  userLocation: CommonFilterSet['userLocation'];
  availableBetween: CommonFilterSet['availableBetween'];
  availableToday: CommonFilterSet['availableToday'];
  availabilityRange: { start: Date; end: Date };
  expanded?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:categories', value: CommonFilterSet['categories']): void;
  (e: 'update:userLocation', value: CommonFilterSet['userLocation']): void;
  (e: 'update:availableBetween', value: CommonFilterSet['availableBetween']): void;
  (e: 'update:availableToday', value: CommonFilterSet['availableToday']): void;
}>();
const { t } = useI18n();

const activeCategories = useVModel(props, 'categories', emit);
const userLocationFilter = useVModel(props, 'userLocation', emit);
const isAvailableBetween = useVModel(props, 'availableBetween', emit);
const isAvailableToday = useVModel(props, 'availableToday', emit);
const { renderGroups: categoryRenderGroups, renderGroupsMeta: categoryRenderGroupsMeta } =
  useCategoryRenderGroups(
    computed(() => props.api.categories),
    computed(() => props.api.categoryGroups),
    computed(() => props.categories),
    t('unlabelledCategoryRenderGroup'),
  );
</script>

<i18n lang="yaml">
en:
  availableToday: 'Available today'
  unlabelledCategoryRenderGroup: 'Features'

de:
  availableToday: 'Heute verfügbar'
  unlabelledCategoryRenderGroup: 'Merkmale'
</i18n>
