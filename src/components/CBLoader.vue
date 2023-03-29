<template>
  <span
    class="cb-loader tw-pointer-events-none tw-w-9 tw-h-9 tw-cb-flex-center"
    :aria-live="label ? 'polite' : undefined"
  >
    <img
      class="tw-animate-spin tw-w-6 tw-h-6"
      style="animation-duration: 1.5s"
      alt=""
      src="../assets/loader.svg"
    />
    <span v-if="label" class="tw-sr-only">{{ label }}</span>
  </span>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string;
}>();
</script>
