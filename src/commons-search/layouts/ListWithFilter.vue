<template>
  <div class="cb-app cb-commons-search">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-bg-base-1 tw-rounded tw-mb-6"
      :api="api"
      :config="config"
      style="grid-area: filter"
      @reset="resetFilters"
    />

    <CBCommonList
      class="tw-isolate tw-z-10 tw-bg-base-1 md:tw-mb-6 tw-rounded"
      :categories="api.categories"
      :commons="filteredAndSortedCommons"
      :location-map="locationMap"
      :selected-location="filter.location"
      :user-location="filter.userLocation"
      :page-size="10"
      @deselect-location="filter.location = null"
      use-multiple-columns
    />
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBCommonFilter from '../components/CBCommonFilter.vue';
import CBCommonList from '../components/CBCommonList.vue';

const props = defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
const { t } = useI18n();
const { filter, resetFilters, filteredAndSortedCommons, locationMap } = useGlobalState();
</script>
