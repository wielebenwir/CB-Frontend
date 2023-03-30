<template>
  <label
    class="cb-category cb-button tw-bg-gray-100 tw-truncate"
    :class="{ 'cb-category--active tw-bg-teal-200': modelValue }"
    tabindex="0"
  >
    <input v-model="value" type="checkbox" class="tw-hidden" />
    <span>{{ category.name }}</span>
  </label>
</template>

<script lang="ts" setup>
import { CommonCategory } from '../types';
import { computed } from 'vue';

const props = defineProps<{
  category: CommonCategory;
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
const value = computed({
  get: () => props.modelValue,
  set: (state: boolean) => {
    emit('update:modelValue', state);
  },
});
</script>
