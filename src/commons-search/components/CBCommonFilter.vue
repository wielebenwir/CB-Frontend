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
        <CBCategoryGroupList v-model="activeCategories" :api="api" />
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
import { useI18n } from 'vue-i18n';
import { useVModel } from '@vueuse/core';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryGroupList from './CBCategoryGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import CBSwitch from './CBSwitch.vue';
import CBAvailabilityRangeFilter from './CBAvailabilityRangeFilter.vue';
import CBCommonFilterPanel from './CBCommonFilterPanel.vue';

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
</script>

<i18n lang="yaml">
en:
  availableToday: 'Available today'

de:
  availableToday: 'Heute verfügbar'
</i18n>
