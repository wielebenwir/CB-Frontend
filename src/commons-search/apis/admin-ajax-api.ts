import { parseISO } from 'date-fns';
import { computed, reactive, Ref, ref } from 'vue';

import { ConfigurationError, HTTPAPIError } from './index';
import { delay } from '../../util';
import type {
  AdminAjaxDataSource,
  Common,
  CommonLocation,
  CommonsSearchAPI,
  CommonsSearchConfiguration,
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
  images: Record<string, [string, number, number, boolean] | false>;
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

async function fetchLocationData(source: AdminAjaxDataSource): Promise<APILocation[]> {
  const res = await fetch(source.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'cb_map_locations',
      nonce: source.nonce,
      cb_map_id: source.mapId.toString(),
    }),
  });

  if (res.ok) {
    return await res.json();
  } else {
    throw new HTTPAPIError(res, `Could not load data from admin-ajax endpoint at '${source.url}'.`);
  }
}

export function useAdminAjaxData(
  config: CommonsSearchConfiguration,
  locationData: Ref<APILocation[]>,
) {
  function createLocationId(location: APILocation) {
    return `${location.lat}-${location.lon}-${location.location_name}`;
  }

  const locations = computed<CommonLocation[]>(() => {
    return locationData.value.map((location) => {
      return {
        id: createLocationId(location),
        name: location.location_name,
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
        description: item.short_desc,
        url: item.link,
        images: Object.values(item.images)
          .filter((item) => item !== false)
          .map((image) => {
            const [url, _width, _height] = image as [string, number, number, boolean];

            // The API does not specify the correct width and height for some images,
            // but the URL may contain their actual values.
            const dimensions = /-(\d+)x(\d+).(?:webp|avif|jpe?g|png|gif)$/i;
            const dimensionsMatch = url.match(dimensions);
            const [width, height] = dimensionsMatch
              ? [parseInt(dimensionsMatch[1]), parseInt(dimensionsMatch[2])]
              : [_width, _height];

            return {
              url,
              width,
              height,
            };
          }),
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

  const categories = computed(() => {
    return config.filter.categories.filter((category) => usedCategoryIds.value.has(category.id));
  });

  const categoryGroups = computed(() => {
    return config.filter.categoryGroups;
  });

  return { categories, categoryGroups, commons, locations };
}

export function createAdminAjaxAPI(
  dataSource: AdminAjaxDataSource,
  config: CommonsSearchConfiguration,
): CommonsSearchAPI {
  ConfigurationError.checkFields<AdminAjaxDataSource>(dataSource, [
    ['url', 'string'],
    ['nonce', 'string'],
    ['mapId', 'number'],
  ]);

  const locationData = ref<APILocation[]>([]);

  async function init() {
    const maxRetries = 10;
    const retryWaitTime = 1.5;
    let retry = 0;

    while (retry++ > maxRetries) {
      try {
        locationData.value = await fetchLocationData(dataSource);
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
