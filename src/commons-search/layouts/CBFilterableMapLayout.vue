<template>
  <CBLoadingOverlay
    class="cb-layout-filterable-map"
    :require-state="['categories', 'categoryGroups', 'locations', 'commons']"
  >
    <CBFilterLayout :api="api" :config="config" class="tw-mb-6" />
    <CBMapWithAutoSidebarLayout :api="api" :config="config" />
  </CBLoadingOverlay>
</template>

<script lang="ts" setup>
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBFilterLayout from './CBFilterLayout.vue';
import CBMapWithAutoSidebarLayout from './CBMapWithAutoSidebarLayout.vue';
import CBLoadingOverlay from '@/commons-search/components/CBLoadingOverlay.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
</script>
