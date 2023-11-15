<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <p class="tw-font-bold tw-m-0" v-html="label" />
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
}>();
</script>
