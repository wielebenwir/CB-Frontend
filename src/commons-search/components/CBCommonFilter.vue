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

    <div class="tw-flex tw-gap-2 tw-items-center tw-flex-wrap">
      <CBSwitch v-model="isAvailableToday" :label="t('availableToday')" />
      <template v-for="filter in appliedFilters" :key="filter.key">
        <button
          type="button"
          class="cb-button tw-bg-gray-200 tw-p-0 tw-gap-0 tw-h-6 tw-items-stretch tw-text-sm"
          :title="t('resetActiveFilter')"
          @click="filter.reset"
        >
          <span class="tw-px-2 tw-cb-flex-center">
            <IconCross class="tw-w-3 tw-h-3 tw-mr-1" />
            {{ filter.label }}
          </span>
          <span v-if="filter.detail" class="tw-px-2 tw-cb-flex-center tw-bg-black/5">
            {{ filter.detail }}
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useVModel } from '@vueuse/core';
import { IconCross } from '../../icons';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryRenderGroupList from './CBCategoryRenderGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import CBSwitch from './CBSwitch.vue';
import CBAvailabilityRangeFilter from './CBAvailabilityRangeFilter.vue';
import CBCommonFilterPanel from './CBCommonFilterPanel.vue';
import { disableCategories, useCategoryRenderGroups } from './categories';

type AppliedFilter = {
  key: string;
  label: string;
  detail?: string;
  reset: () => void;
};

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
const { t, locale } = useI18n();

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
const appliedFilters = computed(() => {
  const filters: AppliedFilter[] = [];

  // category filters
  for (const renderGroup of categoryRenderGroups.value) {
    const meta = categoryRenderGroupsMeta.value.get(renderGroup.id);
    if (meta?.isActive !== true) continue;
    const detail =
      renderGroup.groupedCategories.length === 1
        ? renderGroup.groupedCategories.flat().find((c) => props.categories.has(c.id))?.name ?? ''
        : `${meta.numberOfActiveCategories}`;
    filters.push({
      key: `category-group:${renderGroup.id}`,
      label: renderGroup.label,
      detail,
      reset() {
        activeCategories.value = disableCategories(
          activeCategories.value,
          renderGroup.groupedCategories.flat(),
        );
      },
    });
  }

  // date-range availability
  const { start, end } = props.availableBetween;
  if (start) {
    const formatter = new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'numeric' });
    const detail = `${formatter.format(start)}${end ? ` - ${formatter.format(end)}` : ''}`;
    filters.push({
      key: 'date-range',
      label: t('available'),
      detail,
      reset() {
        isAvailableBetween.value = { start: null, end: null };
      },
    });
  }

  return filters;
});
</script>

<i18n lang="yaml">
en:
  availableToday: 'Available today'
  available: 'Available'
  unlabelledCategoryRenderGroup: 'Features'
  resetActiveFilter: Remove this filter

de:
  availableToday: 'Heute verfügbar'
  available: 'Verfügbar'
  unlabelledCategoryRenderGroup: 'Merkmale'
  resetActiveFilter: Entferne diesen Filter
</i18n>
