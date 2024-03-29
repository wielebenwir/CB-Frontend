import { CommonsSearchAPI, Id } from './types';
import { createGlobalState } from '@vueuse/core';
import { computed, inject, ref, watch } from 'vue';
import { CommonFilterSet, useFilteredData } from './filter';
import { useCommonsSearchAPI } from './apis';
import { getCoordinates, getCoordinatesCenter } from './geo';
import { omit } from '../util';

export const API = Symbol('COMMONS_BOOKING_API');

function getFreshFilterData() {
  return {
    categories: new Set<Id>(),
    userLocation: null,
    location: null,
    mapCenter: null,
    availableToday: false,
    availableBetween: { start: null, end: null },
  };
}

export const useGlobalState = createGlobalState(() => {
  const _api = inject<CommonsSearchAPI>(API) as CommonsSearchAPI;
  const filter = ref<CommonFilterSet>(getFreshFilterData());
  const { api, apiError, retryAPI } = useCommonsSearchAPI(_api);
  const { filteredCommons, filteredAndSortedCommons, locationMap } = useFilteredData(api, filter);

  const canResetFilters = computed(() => {
    const { categories: freshCategories, ...freshData } = omit(getFreshFilterData(), 'mapCenter');
    const { categories: currentCategories, ...currentData } = omit(filter.value, 'mapCenter');

    return (
      JSON.stringify({ categories: Array.from(freshCategories.values()), ...freshData }) !==
      JSON.stringify({ categories: Array.from(currentCategories.values()), ...currentData })
    );
  });

  watch(
    filteredCommons,
    (newCommons) => {
      // We also update the mapCenter through the CBMap component,
      // but we must calculate it as early as possible, so we can avoid multiple sorting runs.
      const coords = getCoordinates(newCommons, locationMap.value, filter.value.userLocation);
      if (coords.length > 0) {
        filter.value.mapCenter = getCoordinatesCenter(coords);
      }
    },
    { flush: 'sync' },
  );

  function resetFilters() {
    filter.value = getFreshFilterData();
  }

  return {
    filter,
    canResetFilters,
    resetFilters,
    api,
    apiError,
    retryAPI,
    filteredCommons,
    filteredAndSortedCommons,
    locationMap,
  };
});
