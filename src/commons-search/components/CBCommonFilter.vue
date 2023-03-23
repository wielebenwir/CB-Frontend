<template>
  <div class="p-6 bg-gray-100">
    <CBLocationFilter
      v-if="config.showLocationDistanceFilter"
      v-model="locationFilter"
      class="mb-4"
      :config="config.geocode"
    />
    <CBCategoryGroupList v-model="activeCategories" :api="api" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommonsSearchAPI, ParsedCommonsSearchConfiguration } from '../types';
import { CommonFilterSet } from '../filter';
import CBCategoryGroupList from './CBCategoryGroupList.vue';
import CBLocationFilter from './CBLocationFilter.vue';

const props = defineProps<{
  api: CommonsSearchAPI;
  config: ParsedCommonsSearchConfiguration;
  modelValue: CommonFilterSet;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: CommonFilterSet): void;
}>();

const activeCategories = computed({
  get() {
    return props.modelValue.categories;
  },
  set(newCategories: CommonFilterSet['categories']) {
    emit('update:modelValue', { ...props.modelValue, categories: newCategories });
  },
});

const locationFilter = computed({
  get() {
    return props.modelValue.location;
  },
  set(location: CommonFilterSet['location']) {
    emit('update:modelValue', { ...props.modelValue, location });
  },
});
</script>
