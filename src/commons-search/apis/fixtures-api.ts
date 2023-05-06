import adminAjaxFixtures, { makeList, generateRandomLocation } from '../fixtures/admin-ajax';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
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
  async function init() {
    const numLocations = isNaN(fixturesConfig.numLocations ?? NaN)
      ? adminAjaxFixtures.length
      : (fixturesConfig.numLocations as number);
    const numRandomLocations = Math.max(0, numLocations - adminAjaxFixtures.length);
    locationData.value = [
      ...adminAjaxFixtures.slice(0, numLocations),
      ...makeList(numRandomLocations, generateRandomLocation),
    ];
  }

  return reactive({
    init,
    type: 'fixtures',
    ...useAdminAjaxData(config, locationData),
  });
}
