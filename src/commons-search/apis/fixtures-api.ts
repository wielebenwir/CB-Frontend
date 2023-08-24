import adminAjaxFixtures, { makeList, generateRandomLocation } from '../fixtures/admin-ajax';
import { CommonsSearchAPI, CommonsSearchConfiguration, LoadingState } from '../types';
import { reactive, ref } from 'vue';
import { APILocation, useAdminAjaxData } from './admin-ajax-api';

type FixturesConfiguration = {
  numLocations?: number | undefined;
};

export function createFixturesAPI(
  fixturesConfig: FixturesConfiguration,
  config: CommonsSearchConfiguration,
): CommonsSearchAPI {
  const locationData = ref<APILocation[]>([]);
  const loading = ref(
    new Set<LoadingState>(['categoryGroups', 'categories', 'commons', 'locations']),
  );
  async function init() {
    const numLocations = isNaN(fixturesConfig.numLocations ?? NaN)
      ? adminAjaxFixtures.length
      : (fixturesConfig.numLocations as number);
    const numRandomLocations = Math.max(0, numLocations - adminAjaxFixtures.length);
    locationData.value = [
      ...adminAjaxFixtures.slice(0, numLocations),
      ...makeList(numRandomLocations, generateRandomLocation),
    ];
    loading.value.clear();
  }

  return reactive({
    init,
    type: 'fixtures',
    loading,
    ...useAdminAjaxData(config, locationData),
  });
}
