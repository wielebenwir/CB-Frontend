<template>
  <CBCategory
    v-for="category in categories"
    :key="category.id"
    :category="category"
    :model-value="modelValue.has(category.id)"
    v-bind="attrs"
    @update:model-value="updateState(category, $event)"
  />
</template>

<script lang="ts" setup>
import { CommonCategory, Id } from '../types';
import CBCategory from './CBCategory.vue';
import { useAttrs } from 'vue';

const props = defineProps<{
  categories: CommonCategory[];
  modelValue: Set<Id>;
}>();
const attrs = useAttrs();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Set<Id>): void;
}>();

function updateState(toggledCategory: CommonCategory, newState: boolean) {
  const activeCategoryIds = new Set(props.modelValue);
  // Only one category of the same category group can be active at a time.
  // We therefore need to
  //   1) reset all categories that belong to this category group
  //   2) activate the filter for the toggled category if its new state is true
  for (const category of props.categories) {
    activeCategoryIds.delete(category.id);
  }
  if (newState) {
    activeCategoryIds.add(toggledCategory.id);
  }
  emit('update:modelValue', activeCategoryIds);
}
</script>
