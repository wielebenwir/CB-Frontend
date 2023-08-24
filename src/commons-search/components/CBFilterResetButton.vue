<template>
  <button
    type="button"
    class="cb-btn tw-bg-base-1 tw-text-sm tw-p-2 tw-ml-2 tw-leading-none"
    :style="{ visibility: visible ? undefined : 'hidden' }"
  >
    {{ t('reset') }}
  </button>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';

defineProps<{
  visible?: boolean;
}>();

const { t } = useI18n();
</script>

<i18n lang="yaml">
en:
  reset: 'Reset'

de:
  reset: 'Zurücksetzen'
</i18n>
