<template>
  <div class="cb-layout-list">
    <CBCommonList
      class="tw-isolate tw-z-10 tw-bg-base-1 md:tw-mb-6 tw-rounded"
      :categories="api.categories"
      :commons="filteredAndSortedCommons"
      :location-map="locationMap"
      :selected-location="filter.location"
      :user-location="filter.userLocation"
      :page-size="10"
      use-multiple-columns
      @deselect-location="filter.location = null"
    />
  </div>
</template>
<script lang="ts" setup>
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBCommonList from '../components/CBCommonList.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
const { filter, filteredAndSortedCommons, locationMap } = useGlobalState();
</script>
