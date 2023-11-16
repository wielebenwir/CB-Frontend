<template>
  <CBCategory
    v-for="category in categories"
    :key="category.id"
    :category="category"
    :model-value="modelValue.has(category.id)"
    :type="group.isExclusive ? 'radio' : 'checkbox'"
    :name="group.isExclusive ? `_rg_${group.id}` : undefined"
    v-bind="attrs"
    @update:model-value="updateState(category, $event)"
  />
</template>

<script lang="ts" setup>
import { CommonCategory, CommonCategoryGroup, Id } from '../types';
import CBCategory from './CBCategory.vue';
import { useAttrs } from 'vue';

const props = defineProps<{
  group: CommonCategoryGroup;
  categories: CommonCategory[];
  modelValue: Set<Id>;
}>();
const attrs = useAttrs();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Set<Id>): void;
}>();

function updateState(toggledCategory: CommonCategory, isActive: boolean) {
  const activeCategoryIds: Set<Id> = props.group.isExclusive
    ? new Set()
    : new Set(props.modelValue);
  if (isActive) {
    activeCategoryIds.add(toggledCategory.id);
  } else {
    activeCategoryIds.delete(toggledCategory.id);
  }
  emit('update:modelValue', activeCategoryIds);
}
</script>
