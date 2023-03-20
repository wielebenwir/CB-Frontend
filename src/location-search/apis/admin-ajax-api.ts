import camelcaseKeys from 'camelcase-keys';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { HTTPAPIError } from './index';
import { delay } from '../../util';
import type { LocationSearchAPI } from '../types';
import { computed, reactive, Ref, ref } from 'vue';

type Day = '1' | '2' | '3' | '4' | '5' | '6' | '7';
type Address = { street: string; city: string; zip: string };
type Timeframe = { date_start: string; date_end: string };
type AvailabilityStatus = 'available' | 'locked' | 'partially-booked' | 'booked';
type Availability = { status: AvailabilityStatus; date: string };
type CommonsBookingItem = {
  id: number;
  name: string;
  short_desc: string;
  link: string;
  thumbnail: string | null;
  status: 'publish';
  terms: number[];
  timeframes: Timeframe[];
  availability: Availability[];
};
export type Location = {
  lat: number;
  lon: number;
  location_name: string;
  location_link: string;
  address: Address;
  closed_days: Day[];
  items: CommonsBookingItem[];
};

type APIConfiguration = { url: string; nonce: string; mapId: number };

async function fetchLocationData(
  configuration: APIConfiguration,
): Promise<CamelCasedPropertiesDeep<Location[]>> {
  const res = await fetch(configuration.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'cb_map_locations',
      nonce: configuration.nonce,
      cb_map_id: configuration.mapId.toString(),
    }),
  });

  if (res.ok) {
    return camelcaseKeys(await res.json(), { deep: true });
  } else {
    throw new HTTPAPIError(
      res,
      `Could not load data from admin-ajax endpoint at '${configuration.url}'.`,
    );
  }
}

export function useAdminAjaxData(locationData: Ref<CamelCasedPropertiesDeep<Location[]>>) {
  const locations = computed(() => {
    return locationData.value.map((item) => {
      return {
        id: `${item.lat}-${item.lon}-${item.locationName}`,
        name: item.locationName,
        coordinates: { lat: item.lat, lng: item.lon },
        address: {
          street: item.address.street,
          postalCode: item.address.zip,
          city: item.address.city,
        },
      };
    });
  });

  return { locations };
}

export function API(configuration: APIConfiguration): LocationSearchAPI {
  const locationData = ref<CamelCasedPropertiesDeep<Location[]>>([]);

  async function init() {
    const maxRetries = 10;
    const retryWaitTime = 1.5;
    let retry = 0;

    while (retry++ > maxRetries) {
      try {
        locationData.value = await fetchLocationData(configuration);
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
    ...useAdminAjaxData(locationData),
  });
}
