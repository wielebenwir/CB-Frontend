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

      <div v-if="expanded" class="cb-common-filter-panel cb-common-filter-panel--expanded">
        <CBCategoryGroupList v-model="activeCategories" :api="api" />
      </div>

      <Popover v-else class="tw-flex-none">
        <PopoverButton ref="filterButtonEl" class="cb-button tw-bg-gray-200">
          <img src="../../assets/filter.svg" class="tw-flex-none" />
          {{ t('filter.label') }}
        </PopoverButton>

        <transition name="cb-animate-panel">
          <PopoverPanel
            class="cb-common-filter-panel tw-absolute tw-mt-3 tw-inset-x-6 tw-z-20 tw-bg-white tw-p-6 tw-shadow-lg tw-rounded-lg"
            :style="{ top: `${filterButtonBottom}px` }"
          >
            <CBCategoryGroupList v-model="activeCategories" :api="api" />
          </PopoverPanel>
        </transition>
      </Popover>
    </div>

    <CBSwitch v-model="isAvailableToday" :label="t('filter.availability.availableToday')" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useVModel } from '@vueuse/core';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import { useI18n } from '../locales';
import { useBottom } from '../../util';
import CBCategoryGroupList from './CBCategoryGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import CBSwitch from './CBSwitch.vue';

const props = defineProps<{
  api: CommonsSearchAPI;
  config: ParsedCommonsSearchConfiguration;
  categories: CommonFilterSet['categories'];
  userLocation: CommonFilterSet['userLocation'];
  availableToday: CommonFilterSet['availableToday'];
  expanded?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:categories', value: CommonFilterSet['categories']): void;
  (e: 'update:userLocation', value: CommonFilterSet['userLocation']): void;
  (e: 'update:availableToday', value: CommonFilterSet['availableToday']): void;
}>();
const { t } = useI18n();
const filterButtonEl = ref();
const filterButtonBottom = useBottom(filterButtonEl);

const activeCategories = useVModel(props, 'categories', emit);
const userLocationFilter = useVModel(props, 'userLocation', emit);
const isAvailableToday = useVModel(props, 'availableToday', emit);
</script>

<style lang="postcss">
.cb-common-filter-panel--expanded .cb-button {
  @apply tw-bg-gray-200;
}
</style>
