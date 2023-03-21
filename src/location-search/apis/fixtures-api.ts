import camelcaseKeys from 'camelcase-keys';
import adminAjaxFixtures from '../fixtures/admin-ajax';
import { LocationSearchAPI, ParsedLocationSearchConfiguration } from '../types';
import { reactive, ref } from 'vue';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { APILocation, useAdminAjaxData } from './admin-ajax-api';

export function API(config: ParsedLocationSearchConfiguration): LocationSearchAPI {
  const locationData = ref<CamelCasedPropertiesDeep<APILocation[]>>([]);
  async function init() {
    locationData.value = camelcaseKeys(adminAjaxFixtures, {
      deep: true,
    });
  }

  return reactive({
    init,
    type: 'fixtures',
    ...useAdminAjaxData(config, locationData),
  });
}
