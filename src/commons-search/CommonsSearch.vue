<template>
  <CBLoadingOverlay
    v-if="!apiError"
    class="cb-layout-wrapper tw-flex tw-flex-col tw-gap-6"
    :require-state="layoutStateRequirements"
  >
    <template v-for="(layoutType, index) in layoutTypes" :key="index">
      <template v-if="layoutType in layouts">
        <component :is="layouts[layoutType].default" :api="api" :config="config" />
      </template>
      <p
        v-else
        role="alert"
        aria-live="polite"
        class="tw-bg-rose-600 tw-text-white tw-p-4 tw-m-0 tw-rounded"
      >
        {{
          t('unknownLayout', {
            layout: layoutType,
            availableLayouts: layoutNames.join(', '),
          })
        }}
      </p>
    </template>
  </CBLoadingOverlay>
  <div
    v-else
    role="alert"
    aria-live="polite"
    class="tw-bg-rose-600 tw-text-white tw-p-4 tw-m-0 tw-rounded"
  >
    <p>{{ t('error') }}</p>
    <pre>{{ String(apiError) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGlobalState } from './state';
import { CommonsSearchConfiguration, LoadingState } from './types';
import { layouts, layoutNames } from './layouts';
import type { LayoutType } from './layouts';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import CBLoadingOverlay from '@/commons-search/components/CBLoadingOverlay.vue';

const props = defineProps<{
  config: CommonsSearchConfiguration;
}>();

const { t } = useI18n();
const { api, apiError } = useGlobalState();
const layoutTypes = computed<LayoutType[]>(
  () => props.config.layout?.types ?? ['Filter', 'MapWithAutoSidebar'],
);
const layoutStateRequirements = computed<LoadingState[]>(() => {
  const requiredState = new Set<LoadingState>();
  for (const layoutType of layoutTypes.value) {
    const _requiredState = layouts[layoutType]?.REQUIRED_STATE ?? [];
    for (const state of _requiredState) requiredState.add(state);
  }
  return Array.from(requiredState);
});
</script>

<i18n lang="yaml">
en:
  error: Unable to initialize CommonsBooking component.
  unknownLayout: You’ve chosen an unknown layout ({layout}). Please choose one of {availableLayouts}.

de:
  error: CommonsBooking Komponente konnte nicht initialisiert werden.
  unknownLayout: Das von dir gewählte Layout existiert nicht ({layout}). Bitte nutze eines von {availableLayouts}.
</i18n>
