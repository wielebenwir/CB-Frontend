<template>
  <label
    class="cb-category cb-btn tw-truncate"
    :class="{ 'cb-category--active tw-bg-active': modelValue, 'tw-bg-base-1': !modelValue }"
    tabindex="0"
    @keydown.space.prevent
    @keyup.space="value = !value"
    @keyup.enter="value = !value"
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
