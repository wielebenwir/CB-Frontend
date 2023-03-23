<template>
  <span
    class="cb-loader pointer-events-none w-9 h-9 tw-c-flex-center"
    :aria-live="label ? 'polite' : undefined"
  >
    <img
      class="animate-spin w-6 h-6"
      style="animation-duration: 1.5s"
      alt=""
      src="../assets/loader.svg"
    />
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string;
}>();
</script>
