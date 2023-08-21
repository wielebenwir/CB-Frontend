<template>
  <div v-if="renderGroupList.length > 0" class="tw-flex tw-flex-col tw-gap-2">
    <div v-for="renderGroup in renderGroupList" :key="renderGroup.id">
      <header class="tw-flex tw-items-center tw-justify-between tw-mb-1">
        <CBFilterLabel
          :id="`${labelPrefix}-${renderGroup.id}`"
          :label="renderGroup.label"
          class="tw-mb-0"
        />
        <button
          v-if="renderGroupMeta.get(renderGroup.id)?.isActive"
          type="button"
          class="cb-btn tw-bg-base-1 tw-text-sm tw-p-1"
          :aria-label="t('reset', { attr: renderGroup.label })"
          @click="value = disableCategories(modelValue, renderGroup.groupedCategories.flat())"
        >
          <IconCross class="tw-w-4 tw-h-4" />
        </button>
      </header>

      <div class="tw-flex tw-flex-wrap tw-gap-2">
        <template v-for="(categories, index) in renderGroup.groupedCategories" :key="index">
          <CBCategoryGroup
            v-model="value"
            :categories="categories"
            :aria-describedby="`${labelPrefix}-${renderGroup.id}`"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useVModel } from '@vueuse/core';
import CBFilterLabel from './CBFilterLabel.vue';
import CBCategoryGroup from './CBCategoryGroup.vue';
import { CategoryRenderGroup, CategoryRenderGroupMetaMap, disableCategories } from './categories';
import { IconCross } from '../../icons';
import { Id } from '../types';

const labelPrefix = 'category-render-group-label';

const props = defineProps<{
  modelValue: Set<Id>;
  renderGroupList: CategoryRenderGroup[];
  renderGroupMeta: CategoryRenderGroupMetaMap;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Set<number>): void;
}>();
const { t } = useI18n();

const value = useVModel(props, 'modelValue', emit);
</script>

<i18n lang="yaml">
en:
  reset: 'Reset filter for {attr}.'

de:
  reset: 'Filter für {attr} zurücksetzen.'
</i18n>
