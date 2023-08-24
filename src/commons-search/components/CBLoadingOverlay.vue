<template>
  <div :class="{ 'tw-relative': shouldDisplayOverlay }">
    <slot />

    <div
      v-if="shouldDisplayOverlay"
      class="tw-absolute tw-z-50 -tw-inset-2 tw-bg-white/20 tw-rounded tw-backdrop-blur-[2px] tw-flex tw-justify-center tw-items-center"
    >
      <div
        class="tw-w-min tw-max-w-full tw-py-4 tw-px-8 tw-bg-white/75 tw-backdrop-blur-lg tw-shadow-lg tw-rounded tw-flex tw-items-center tw-gap-6 tw-text-lg tw-whitespace-nowrap"
      >
        <svg
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          class="tw-w-8 tw-h-8 tw-relative tw-top-1"
        >
          <circle cx="4" cy="12" r="3">
            <animate
              id="spinner_jObz"
              attributeName="r"
              begin="0;spinner_vwSQ.end-0.25s"
              dur="0.75s"
              values="3;.2;3"
            />
          </circle>
          <circle cx="12" cy="12" r="3">
            <animate attributeName="r" begin="spinner_jObz.end-0.6s" dur="0.75s" values="3;.2;3" />
          </circle>
          <circle cx="20" cy="12" r="3">
            <animate
              id="spinner_vwSQ"
              attributeName="r"
              begin="spinner_jObz.end-0.45s"
              dur="0.75s"
              values="3;.2;3"
            />
          </circle>
        </svg>
        <p class="tw-m-0">{{ t('loading') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed } from 'vue';
import { LoadingState } from '../types';
import { useGlobalState } from '../state';

const props = defineProps<{
  requireState: LoadingState[];
}>();

const { api } = useGlobalState();
const { t } = useI18n();

const shouldDisplayOverlay = computed(() => {
  return props.requireState.some((state) => api.value.loading.has(state));
});
</script>

<i18n lang="yaml">
de:
  loading: Lade Daten

en:
  loading: Loading data
</i18n>
