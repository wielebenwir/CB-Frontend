<template>
  <div class="flex flex-col gap-2">
    <template v-if="groupedCategoriesWithNamedGroup.size > 0">
      <div v-for="[group, categories] in groupedCategoriesWithNamedGroup" :key="group.id">
        <CBFilterLabel :label="group?.name" />
        <div class="flex flex-wrap gap-2">
          <CBCategoryGroup v-model="value" :categories="categories" />
        </div>
      </div>
    </template>
    <div v-if="groupedCategoriesWithoutNamedGroup.size > 0">
      <CBFilterLabel :label="t('filter.categoryGroup.unlabelled')" />
      <div class="flex flex-wrap gap-2">
        <template v-for="[group, categories] in groupedCategoriesWithoutNamedGroup" :key="group.id">
          <CBCategoryGroup v-model="value" :categories="categories" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommonCategory, LocationSearchAPI } from '../types';
import { useGroupBy } from '../../util';
import CBFilterLabel from './CBFilterLabel.vue';
import CBCategoryGroup from './CBCategoryGroup.vue';
import { useI18n } from '../locales';

const props = defineProps<{
  api: LocationSearchAPI;
  modelValue: Set<number>;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: Set<number>): void;
}>();
const { t } = useI18n();

const value = computed({
  get: () => props.modelValue,
  set: (value: Set<number>) => {
    emit('update:modelValue', value);
  },
});
const groupMap = computed(() => new Map(props.api.categoryGroups.map((g) => [g.id, g])));
const categoriesWithNamedGroup = computed(() =>
  props.api.categories.filter((c) => hasGroupName(c)),
);
const categoriesWithoutNamedGroup = computed(() =>
  props.api.categories.filter((c) => !hasGroupName(c)),
);
const groupedCategoriesWithNamedGroup = useGroupBy(categoriesWithNamedGroup, byGroup);
const groupedCategoriesWithoutNamedGroup = useGroupBy(categoriesWithoutNamedGroup, byGroup);

function byGroup(category: CommonCategory) {
  return groupMap.value.get(category.groupId);
}

function hasGroupName(category: CommonCategory) {
  return Boolean(groupMap.value.get(category.groupId)?.name);
}
</script>
