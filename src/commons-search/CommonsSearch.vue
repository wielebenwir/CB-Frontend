<template>
  <component v-if="api" :is="layouts[layoutType]" :api="api" :config="config" />
  <div v-else-if="apiError" role="alert" aria-live="polite">
    <p>{{ t('error') }}</p>
    <pre>{{ String(apiError) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Component } from 'vue';
import { useGlobalState } from './state';
import { CommonsSearchConfiguration } from './types';
import * as layouts from './layouts';
import type { LayoutType } from './layouts';
import { useI18n } from '@rokoli/vue-tiny-i18n';

const props = defineProps<{
  config: CommonsSearchConfiguration;
}>();

const { t } = useI18n();
const { api, apiError } = useGlobalState();
const layoutType = computed<LayoutType>(
  () => props.config.layout?.type ?? 'CalendarAndFilterWithOptionalMap',
);
</script>

<i18n lang="yaml">
en:
  error: Unable to initialize CommonsBooking component.

de:
  error: CommonsBooking Komponente konnte nicht initialisiert werden.
</i18n>
