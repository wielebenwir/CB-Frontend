<template>
  <p v-if="label" class="tw-font-bold tw-m-0">{{ label }}</p>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string;
}>();
</script>
