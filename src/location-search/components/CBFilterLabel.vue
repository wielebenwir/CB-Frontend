<template>
  <p v-if="label" class="font-bold mb-1">{{ label }}</p>
</template>

<script lang="ts" setup>
defineProps<{
  label?: string;
}>();
</script>
