<template>
  <div class="cb-common-filter tw-p-6 tw-relative tw-border-b tw-border-gray-300">
    <div class="tw-flex tw-gap-3 tw-max-w-full" :class="{ 'tw-flex-col': expanded }">
      <CBLocationFilter
        v-if="config.showLocationDistanceFilter"
        v-model="userLocationFilter"
        class="tw-min-w-0 tw-flex-1"
        :config="config.geocode"
      />

      <div v-if="expanded" class="cb-common-filter-panel--expanded">
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
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryGroupList from './CBCategoryGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useI18n } from '../locales';
import { useBottom } from '../../util';

const props = defineProps<{
  api: CommonsSearchAPI;
  config: ParsedCommonsSearchConfiguration;
  modelValue: CommonFilterSet;
  expanded?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: CommonFilterSet): void;
}>();
const { t } = useI18n();
const filterButtonEl = ref();
const filterButtonBottom = useBottom(filterButtonEl);

const activeCategories = computed({
  get() {
    return props.modelValue.categories;
  },
  set(newCategories: CommonFilterSet['categories']) {
    emit('update:modelValue', { ...props.modelValue, categories: newCategories });
  },
});

const userLocationFilter = computed({
  get() {
    return props.modelValue.userLocation;
  },
  set(userLocation: CommonFilterSet['userLocation']) {
    emit('update:modelValue', { ...props.modelValue, userLocation });
  },
});
</script>

<style lang="postcss">
.cb-common-filter-panel--expanded .cb-button {
  @apply tw-bg-gray-200;
}
</style>
