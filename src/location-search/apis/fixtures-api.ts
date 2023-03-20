import camelcaseKeys from 'camelcase-keys';
import adminAjaxFixtures from '../fixtures/admin-ajax';
import { LocationSearchAPI } from '../types';
import { reactive, ref } from 'vue';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { Location, useAdminAjaxData } from './admin-ajax-api';

export function API(): LocationSearchAPI {
  const locationData = ref<CamelCasedPropertiesDeep<Location[]>>([]);
  async function init() {
    locationData.value = camelcaseKeys(adminAjaxFixtures, {
      deep: true,
    });
  }

  return reactive({
    init,
    type: 'fixtures',
    ...useAdminAjaxData(locationData),
  });
}
