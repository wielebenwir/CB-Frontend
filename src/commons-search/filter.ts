import { computed, Ref } from 'vue';
import { Common, CommonLocation, CommonsSearchAPI } from './types';

export interface CommonFilterSet {
  categories: Set<number>;
}

function filterByCategories(relevantCategoryIds: Set<number>) {
  return (common: Common) =>
    Array.from(relevantCategoryIds).every((id) => common.categoryIds.includes(id));
}

function filterByRelevantLocations(relevantLocationIds: Set<string>) {
  return (location: CommonLocation) => relevantLocationIds.has(location.id);
}

export function useFilteredData(
  api: Ref<CommonsSearchAPI | undefined>,
  filter: Ref<CommonFilterSet>,
) {
  const filteredCommons = computed(() => {
    const commons = api.value?.commons ?? [];
    return commons.filter(filterByCategories(filter.value.categories));
  });
  const relevantLocationIds = computed(
    () => new Set(filteredCommons.value.map((common) => common.locationId)),
  );
  const filteredLocations = computed(() => {
    const locations = api.value?.locations ?? [];
    return locations.filter(filterByRelevantLocations(relevantLocationIds.value));
  });

  return { filteredLocations, filteredCommons };
}
