<template>
  <div class="cb-layout-filter">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-bg-base-1 tw-rounded"
      :api="api"
      :config="config"
      style="grid-area: filter"
      :can-reset="canResetFilters"
      :expanded="isExpanded"
      @reset="resetFilters"
    />
  </div>
</template>

<script lang="ts" setup>
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBCommonFilter from '../components/CBCommonFilter.vue';
import { hasLayoutOption, isSmallViewport } from '../../util';
import { computed } from 'vue';

const props = defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();

const { filter, canResetFilters, resetFilters } = useGlobalState();
const isExpanded = computed(() => {
  return (
    hasLayoutOption(props.config, 'filter-expanded') ||
    (isSmallViewport.value && hasLayoutOption(props.config, 'filter-expanded-mobile')) ||
    (!isSmallViewport.value && hasLayoutOption(props.config, 'filter-expanded-desktop'))
  );
});
</script>
