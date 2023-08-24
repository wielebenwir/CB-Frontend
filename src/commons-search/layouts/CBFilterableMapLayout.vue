<template>
  <div class="cb-layout-filterable-map">
    <CBFilterLayout :api="api" :config="config" class="tw-mb-6" />
    <CBMapWithAutoSidebarLayout :api="api" :config="config" />
  </div>
</template>

<script lang="ts" setup>
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBFilterLayout from './CBFilterLayout.vue';
import CBMapWithAutoSidebarLayout from './CBMapWithAutoSidebarLayout.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
</script>
