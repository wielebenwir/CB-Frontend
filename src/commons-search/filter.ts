import haversine from 'haversine-distance';
import { computed, Ref } from 'vue';
import { useMap } from '../util';
import { Common, CommonLocation, CommonsSearchAPI } from './types';
import { GeoLocation } from './geo';

export interface CommonFilterSet {
  categories: Set<number>;
  userLocation: GeoLocation | null;
  location: CommonLocation | null;
}

function filterByCategories(relevantCategoryIds: Set<number>) {
  return (common: Common) =>
    Array.from(relevantCategoryIds).every((id) => common.categoryIds.includes(id));
}

function filterByRelevantLocations(relevantLocationIds: Set<string>) {
  return (location: CommonLocation) => relevantLocationIds.has(location.id);
}

function filterByLocation(location: CommonLocation | null) {
  return (common: Common) => (location ? common.locationId === location.id : true);
}

function sortByDistance(location: GeoLocation | null, locationMap: Map<string, CommonLocation>) {
  return function (a: Common, b: Common) {
    if (!location) return 0;
    const locationA = locationMap.get(a.locationId)?.coordinates;
    const locationB = locationMap.get(b.locationId)?.coordinates;
    if (!locationA || !locationB) return 0;
    const distanceA = haversine(location, locationA);
    const distanceB = haversine(location, locationB);
    return distanceB < distanceA ? 1 : -1;
  };
}

export function useFilteredData(
  api: Ref<CommonsSearchAPI | undefined>,
  filter: Ref<CommonFilterSet>,
) {
  const locations = computed(() => api.value?.locations ?? []);
  const locationMap = useMap(locations, 'id');

  const filteredCommons = computed(() => {
    const commons = api.value?.commons ?? [];
    return commons
      .filter(filterByCategories(filter.value.categories))
      .filter(filterByLocation(filter.value.location))
      .sort(sortByDistance(filter.value.userLocation, locationMap.value));
  });

  const relevantLocationIds = computed(
    () => new Set(filteredCommons.value.map((common) => common.locationId)),
  );
  const filteredLocations = computed(() => {
    return locations.value.filter(filterByRelevantLocations(relevantLocationIds.value));
  });

  return { filteredLocations, filteredCommons };
}
