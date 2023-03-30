<template>
  <div class="tw-p-6 tw-bg-gray-100">
    <CBLocationFilter
      v-if="config.showLocationDistanceFilter"
      v-model="userLocationFilter"
      class="tw-mb-4"
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

const userLocationFilter = computed({
  get() {
    return props.modelValue.userLocation;
  },
  set(userLocation: CommonFilterSet['userLocation']) {
    emit('update:modelValue', { ...props.modelValue, userLocation });
  },
});
</script>
