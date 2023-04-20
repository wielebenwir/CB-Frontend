<template>
  <span
    class="cb-loader tw-pointer-events-none tw-w-9 tw-h-9 tw-cb-flex-center"
    :aria-live="label ? 'polite' : undefined"
  >
    <IconLoader
      class="tw-animate-spin tw-w-6 tw-h-6"
      style="animation-duration: 1.5s"
      role="presentation"
    />
    <span v-if="label" class="tw-sr-only">{{ label }}</span>
  </span>
</template>

<script lang="ts" setup>
import { IconLoader } from '../icons';

defineProps<{
  label?: string;
}>();
</script>
