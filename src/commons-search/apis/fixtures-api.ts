import adminAjaxFixtures from '../fixtures/admin-ajax';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import { reactive, ref } from 'vue';
import { APILocation, useAdminAjaxData } from './admin-ajax-api';

export function API(config: CommonsSearchConfiguration): CommonsSearchAPI {
  const locationData = ref<APILocation[]>([]);
  async function init() {
    locationData.value = adminAjaxFixtures;
  }

  return reactive({
    init,
    type: 'fixtures',
    ...useAdminAjaxData(config, locationData),
  });
}
