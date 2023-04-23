<template>
  <p v-if="label" class="tw-font-bold tw-mt-0 tw-mb-1">{{ label }}</p>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string;
}>();
</script>
