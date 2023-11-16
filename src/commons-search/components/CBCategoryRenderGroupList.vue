<template>
  <div v-for="renderGroup in renderGroupList" :key="renderGroup.id">
    <header class="tw-flex tw-items-center tw-mb-1">
      <CBFilterLabel
        v-if="renderGroup.label"
        :id="`${labelPrefix}-${renderGroup.id}`"
        :label="renderGroup.label"
        class="tw-mb-0"
      />
      <CBFilterResetButton
        :visible="renderGroupMeta.get(renderGroup.id)?.isActive"
        :aria-label="t('reset', { attr: renderGroup.label })"
        @click="disableRenderGroup(renderGroup)"
      />
    </header>

    <div class="tw-flex tw-flex-wrap tw-gap-2">
      <template v-for="(group, index) in renderGroup.groups" :key="index">
        <CBCategoryGroup
          v-model="value"
          :group="group"
          :categories="group.categories"
          :aria-describedby="`${labelPrefix}-${renderGroup.id}`"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useVModel } from '@vueuse/core';
import CBFilterLabel from './CBFilterLabel.vue';
import CBCategoryGroup from './CBCategoryGroup.vue';
import { CategoryRenderGroup, CategoryRenderGroupMetaMap, disableCategories } from './categories';
import { Id } from '../types';
import CBFilterResetButton from '@/commons-search/components/CBFilterResetButton.vue';

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

function disableRenderGroup(renderGroup: CategoryRenderGroup) {
  value.value = disableCategories(
    props.modelValue,
    renderGroup.groups.flatMap((g) => g.categories),
  );
}
</script>

<i18n lang="yaml">
en:
  reset: 'Reset filter for {attr}.'

de:
  reset: 'Filter für {attr} zurücksetzen.'
</i18n>
