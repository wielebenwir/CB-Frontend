<template>
  <div class="tw-flex tw-flex-col tw-gap-2">
    <div v-for="renderGroup in renderGroupList" :key="renderGroup.id">
      <header class="tw-flex tw-items-center tw-justify-between tw-mb-1">
        <CBFilterLabel :label="renderGroup.label" class="tw-mb-0" />
        <button
          v-if="renderGroupMeta.get(renderGroup.id)?.isActive"
          type="button"
          class="cb-button tw-bg-gray-100 tw-text-sm tw-p-1"
          @click="value = disableCategories(modelValue, renderGroup.groupedCategories.flat())"
        >
          <IconCross />
        </button>
      </header>

      <div class="tw-flex tw-flex-wrap tw-gap-2">
        <template v-for="(categories, index) in renderGroup.groupedCategories" :key="index">
          <CBCategoryGroup v-model="value" :categories="categories" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CBFilterLabel from './CBFilterLabel.vue';
import CBCategoryGroup from './CBCategoryGroup.vue';
import { CategoryRenderGroup, CategoryRenderGroupMetaMap, disableCategories } from './categories';
import { useVModel } from '@vueuse/core';
import { IconCross } from '../../icons';
import { Id } from '../types';

const props = defineProps<{
  modelValue: Set<Id>;
  renderGroupList: CategoryRenderGroup[];
  renderGroupMeta: CategoryRenderGroupMetaMap;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Set<number>): void;
}>();

const value = useVModel(props, 'modelValue', emit);
</script>
