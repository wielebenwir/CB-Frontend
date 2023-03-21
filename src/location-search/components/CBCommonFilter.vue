<template>
  <div class="p-6 bg-gray-100">
    <CBCategoryGroupList v-model="activeCategories" :api="api" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommonFilterSet, LocationSearchAPI } from '../types';
import CBCategoryGroupList from './CBCategoryGroupList.vue';

const props = defineProps<{
  api: LocationSearchAPI;
  modelValue: CommonFilterSet;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: CommonFilterSet): void;
}>();

const activeCategories = computed({
  get() {
    return props.modelValue.categories;
  },
  set(newCategories: Set<number>) {
    emit('update:modelValue', { ...props.modelValue, categories: newCategories });
  },
});
</script>
