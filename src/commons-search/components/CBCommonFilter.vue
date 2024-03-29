<template>
  <div class="cb-common-filter tw-p-4 md:tw-p-6 tw-relative tw-flex tw-flex-col tw-gap-2">
    <div class="tw-flex tw-gap-3 tw-max-w-full" :class="{ 'tw-flex-col': expanded }">
      <CBLocationFilter
        v-if="config.geocode"
        v-model="userLocationFilter"
        class="tw-min-w-0 tw-flex-1"
        :config="config.geocode"
      />

      <slot />

      <CBCommonFilterPanel :expanded="expanded">
        <CBCategoryRenderGroupList
          v-model="activeCategories"
          :render-group-list="categoryRenderGroups"
          :render-group-meta="categoryRenderGroupsMeta"
        />

        <CBAvailabilityRangeFilter
          v-model="isAvailableBetween"
          :availability-range="availabilityRange"
        >
          <CBSwitch
            v-if="expanded"
            v-model="isAvailableToday"
            :label="t('availableToday')"
            class="tw-mt-2"
          />
        </CBAvailabilityRangeFilter>

        <button
          v-if="!expanded && canReset"
          type="button"
          class="cb-btn tw-bg-base-1"
          @click="emit('reset')"
        >
          {{ t('resetFilters') }}
        </button>
      </CBCommonFilterPanel>
    </div>

    <CBSwitch v-if="!expanded" v-model="isAvailableToday" :label="t('availableToday')" />

    <div
      v-if="!expanded && appliedFilters.length > 0"
      class="tw-flex tw-gap-2 tw-items-center tw-flex-wrap"
    >
      <template v-for="filter in appliedFilters" :key="filter.key">
        <button
          type="button"
          class="cb-btn tw-bg-base-2 tw-p-0 tw-gap-0 tw-h-6 tw-items-stretch tw-text-sm"
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

    <button
      v-if="expanded && canReset"
      type="button"
      class="cb-btn tw-bg-base-2 tw-mt-4"
      @click="emit('reset')"
    >
      {{ t('resetFilters') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useVModel } from '@vueuse/core';
import { IconCross } from '../../icons';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryRenderGroupList from './CBCategoryRenderGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';
import CBSwitch from './CBSwitch.vue';
import CBAvailabilityRangeFilter from './CBAvailabilityRangeFilter.vue';
import CBCommonFilterPanel from './CBCommonFilterPanel.vue';
import { disableCategories, useCategoryRenderGroups } from './categories';
import { parseISO } from 'date-fns';

type AppliedFilter = {
  key: string;
  label: string;
  detail?: string;
  reset: () => void;
};

const props = defineProps<{
  api: CommonsSearchAPI;
  config: CommonsSearchConfiguration;
  categories: CommonFilterSet['categories'];
  userLocation: CommonFilterSet['userLocation'];
  availableBetween: CommonFilterSet['availableBetween'];
  availableToday: CommonFilterSet['availableToday'];
  expanded?: boolean;
  canReset?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:categories', value: CommonFilterSet['categories']): void;
  (e: 'update:userLocation', value: CommonFilterSet['userLocation']): void;
  (e: 'update:availableBetween', value: CommonFilterSet['availableBetween']): void;
  (e: 'update:availableToday', value: CommonFilterSet['availableToday']): void;
  (e: 'reset'): void;
}>();
const { t, locale } = useI18n();
const availabilityRange = computed(() => ({
  start: parseISO(props.config.filter.availability.dateRange.start),
  end: parseISO(props.config.filter.availability.dateRange.end),
}));

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
      renderGroup.groups.length === 1
        ? renderGroup.groups.flatMap((g) => g.categories).find((c) => props.categories.has(c.id))
            ?.name ?? ''
        : `${meta.numberOfActiveCategories}`;
    filters.push({
      key: `category-group:${renderGroup.id}`,
      label: renderGroup.label,
      detail,
      reset() {
        activeCategories.value = disableCategories(
          activeCategories.value,
          renderGroup.groups.flatMap((g) => g.categories),
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
  resetFilters: Reset all filters

de:
  availableToday: 'Heute verfügbar'
  available: 'Verfügbar'
  unlabelledCategoryRenderGroup: 'Merkmale'
  resetActiveFilter: Entferne diesen Filter
  resetFilters: Alle Filter zurücksetzen
</i18n>
