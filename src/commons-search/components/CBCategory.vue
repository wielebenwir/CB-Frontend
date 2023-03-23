<template>
  <label
    class="cb-category cb-button bg-gray-200 truncate"
    :class="{ 'cb-category--active bg-teal-200': modelValue }"
    tabindex="0"
  >
    <input v-model="value" type="checkbox" class="hidden" />
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
