import camelcaseKeys from 'camelcase-keys';
import { parseISO } from 'date-fns';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { computed, reactive, Ref, ref } from 'vue';

import { HTTPAPIError } from './index';
import { delay } from '../../util';
import type {
  Common,
  CommonCategory,
  CommonCategoryGroup,
  CommonLocation,
  CommonsSearchAPI,
  ParsedCommonsSearchConfiguration,
} from '../types';

type APIDay = '1' | '2' | '3' | '4' | '5' | '6' | '7';
type APIAddress = { street: string; city: string; zip: string };
type APITimeframe = { date_start: string; date_end: string };
export type APIAvailabilityStatus = 'available' | 'locked' | 'partially-booked' | 'booked';
type APIAvailability = { status: APIAvailabilityStatus; date: string };
type APIItem = {
  id: number;
  name: string;
  short_desc: string;
  link: string;
  thumbnail: string | null;
  status: 'publish';
  terms: number[];
  timeframes: APITimeframe[];
  availability: APIAvailability[];
};
export type APILocation = {
  lat: number;
  lon: number;
  location_name: string;
  location_link: string;
  address: APIAddress;
  closed_days: APIDay[];
  items: APIItem[];
};

async function fetchLocationData(
  configuration: ParsedCommonsSearchConfiguration,
): Promise<CamelCasedPropertiesDeep<APILocation[]>> {
  const res = await fetch(configuration.dataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'cb_map_locations',
      nonce: configuration.nonce,
      cb_map_id: configuration.cbMapId.toString(),
    }),
  });

  if (res.ok) {
    return camelcaseKeys(await res.json(), { deep: true });
  } else {
    throw new HTTPAPIError(
      res,
      `Could not load data from admin-ajax endpoint at '${configuration.dataUrl}'.`,
    );
  }
}

export function useAdminAjaxData(
  config: ParsedCommonsSearchConfiguration,
  locationData: Ref<CamelCasedPropertiesDeep<APILocation[]>>,
) {
  function createLocationId(location: CamelCasedPropertiesDeep<APILocation>) {
    return `${location.lat}-${location.lon}-${location.locationName}`;
  }

  const locations = computed<CommonLocation[]>(() => {
    return locationData.value.map((location) => {
      return {
        id: createLocationId(location),
        name: location.locationName,
        coordinates: { lat: location.lat, lng: location.lon },
        address: {
          street: location.address.street,
          postalCode: location.address.zip,
          city: location.address.city,
        },
      };
    });
  });

  const commons = computed<Common[]>(() => {
    return locationData.value.flatMap((location) => {
      return location.items.map((item) => ({
        id: item.id,
        locationId: createLocationId(location),
        categoryIds: item.terms,
        name: item.name,
        description: item.shortDesc,
        url: item.link,
        image: item.thumbnail
          ? {
              url: item.thumbnail,
            }
          : null,
        availabilities: item.availability.map((a) => ({
          status: a.status,
          date: parseISO(a.date),
        })),
      }));
    });
  });

  const usedCategoryIds = computed(() => {
    return new Set(commons.value.flatMap((common) => common.categoryIds));
  });

  const categories = computed<CommonCategory[]>(() => {
    return Object.entries(config.filterCbItemCategories).flatMap(([key, filter]) => {
      return filter.elements
        .map((category) => ({
          id: category.catId,
          name: category.markup,
          groupId: key,
        }))
        .filter((category) => usedCategoryIds.value.has(category.id));
    });
  });

  const categoryGroups = computed<CommonCategoryGroup[]>(() => {
    return Object.entries(config.filterCbItemCategories).map(([key, filter]) => ({
      id: key,
      name: filter.name.trim(),
    }));
  });

  return { categories, categoryGroups, commons, locations };
}

export function API(config: ParsedCommonsSearchConfiguration): CommonsSearchAPI {
  const locationData = ref<CamelCasedPropertiesDeep<APILocation[]>>([]);

  async function init() {
    const maxRetries = 10;
    const retryWaitTime = 1.5;
    let retry = 0;

    while (retry++ > maxRetries) {
      try {
        locationData.value = await fetchLocationData(config);
        break;
      } catch (error) {
        const waitTime = retry * retryWaitTime;
        console.error(`Unable to load data. Retrying in ${waitTime} seconds.`, error);
        await delay(waitTime);
      }
    }
  }

  return reactive({
    init,
    type: 'admin-ajax',
    ...useAdminAjaxData(config, locationData),
  });
}
