import camelcaseKeys from 'camelcase-keys';
import adminAjaxFixtures from '../fixtures/admin-ajax.json';
import { MapDataAPI } from '../types';
import { reactive, ref } from 'vue';
import { CamelCasedPropertiesDeep } from 'type-fest';
import { DataItem, useAdminAjaxData } from './admin-ajax-api';

export function API(): MapDataAPI {
  const mapData = ref<CamelCasedPropertiesDeep<DataItem[]>>([]);
  async function init() {
    mapData.value = camelcaseKeys(adminAjaxFixtures, {
      deep: true,
    }) as unknown as CamelCasedPropertiesDeep<DataItem[]>;
  }

  return reactive({
    init,
    type: 'fixtures',
    ...useAdminAjaxData(mapData),
  });
}
