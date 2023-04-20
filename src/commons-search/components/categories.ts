import { CommonCategory, CommonCategoryGroup } from '../types';
import { computed, Ref } from 'vue';
import { groupBy, partition, useMap } from '../../util';

export type CategoryRenderGroup = {
  id: string;
  label: string;
  groupedCategories: CommonCategory[][];
};

type CategoryRenderGroupMeta = {
  label: string;
  numberOfActiveCategories: number;
  isActive: boolean;
};

export type CategoryRenderGroupMetaMap = Map<string, CategoryRenderGroupMeta>;

export function useCategoryRenderGroups(
  categories: Ref<CommonCategory[]>,
  categoryGroups: Ref<CommonCategoryGroup[]>,
  activeCategoryIds: Ref<Set<number>>,
  ungroupedLabel: string,
) {
  function getGroup(category: CommonCategory) {
    return groupMap.value.get(category.groupId) as CommonCategoryGroup;
  }

  function hasGroupName(category: CommonCategory) {
    return Boolean(groupMap.value.get(category.groupId)?.name);
  }

  function getNumberOfActiveCategories(categories: CommonCategory[]) {
    return categories.reduce((total, c) => total + (activeCategoryIds.value.has(c.id) ? 1 : 0), 0);
  }

  function* findRenderGroups(): Iterable<CategoryRenderGroup> {
    const [categoriesWithNamedGroup, categoriesWithoutNamedGroup] = partition(
      categories.value,
      hasGroupName,
    );

    for (const [group, categories] of groupBy(categoriesWithNamedGroup, getGroup)) {
      yield {
        id: group.id,
        label: group.name,
        groupedCategories: [categories],
      };
    }
    yield {
      id: 'unlabelled-group',
      label: ungroupedLabel,
      groupedCategories: Array.from(groupBy(categoriesWithoutNamedGroup, getGroup).values()),
    };
  }

  const groupMap = useMap(categoryGroups, 'id');
  const renderGroups = computed(() => Array.from(findRenderGroups()));
  const renderGroupsMeta = computed<CategoryRenderGroupMetaMap>(() => {
    return new Map(
      renderGroups.value.map(({ id, label, groupedCategories }) => {
        const numberOfActiveCategories = getNumberOfActiveCategories(groupedCategories.flat());
        const isActive = numberOfActiveCategories > 0;
        const meta = { id, label, numberOfActiveCategories, isActive };
        return [id, meta];
      }),
    );
  });

  return { renderGroups, renderGroupsMeta };
}
