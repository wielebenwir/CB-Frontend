import { parseISO } from 'date-fns';
import { computed, reactive, Ref, ref } from 'vue';

import { ConfigurationError, HTTPAPIError } from './index';
import { delay } from '../../util';
import type {
  AdminAjaxDataSource,
  Common,
  CommonAvailabilityStatus,
  CommonLocation,
  CommonsSearchAPI,
  CommonsSearchConfiguration,
  Id,
  LoadingState,
} from '../types';

export type APIDay = '1' | '2' | '3' | '4' | '5' | '6' | '7';
type APIAddress = { street: string; city: string; zip: string };
type APITimeframe = { date_start: string; date_end: string };
export type APIAvailabilityStatus =
  | 'available'
  | 'locked'
  | 'partially-booked'
  | 'booked'
  | 'location-holiday';
type APIAvailability = { status: APIAvailabilityStatus; date: string };
export type APIItem = {
  id: Id;
  name: string;
  short_desc: string;
  link: string;
  thumbnail: string | null;
  images?: Record<string, [string, number, number, boolean] | false>;
  status: 'publish';
  terms: number[];
  timeframes: APITimeframe[];
  availability?: APIAvailability[];
};
export type APILocation = {
  lat: number;
  lon: number;
  location_name: string;
  location_link: string;
  address: APIAddress;
  closed_days: APIDay[] | string;
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

function parseSerializedPHPScalar<T>(serializedValue: string, defaultValue?: T): T {
  const types: [RegExp, (v: string) => unknown][] = [
    // booleans
    [/^b:([01]);$/, (v: string) => v === '1'],
    // integers
    [/^i:(\d+);$/, (v: string) => parseInt(v)],
    // floats
    [/^d:(\d+(?:\.\d+)?);$/, (v: string) => parseFloat(v)],
    // strings
    [/^s:\d+:"(.*)";$/, (v: string) => v],
  ];
  for (const [format, convert] of types) {
    const match = serializedValue.match(format);
    if (match) {
      return convert(match[1]) as T;
    }
  }
  if (defaultValue !== undefined) return defaultValue;
  throw new TypeError(`Unknown PHP scalar type for value: ${serializedValue}`);
}

function parseSerializedPHPArray<T>(serializedArray: string): T[] {
  const match = serializedArray.match(/^a:(\d+):{(.*)}$/);
  if (match === null) return [];
  const size = parseInt(match[1]);
  let contents = match[2];
  const result = new Array(size);

  function popSerialized() {
    const currentValueEnd = contents.indexOf(';') + 1;
    const value = contents.substring(0, currentValueEnd);
    contents = contents.substring(currentValueEnd);
    return value;
  }

  while (contents) {
    const index = parseSerializedPHPScalar<number>(popSerialized());
    const value = parseSerializedPHPScalar<T>(popSerialized());
    result[index] = value;
  }

  return result;
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

  const configuredCategoryIds = config.filter.categories.map((c) => c.id);

  const commons = computed<Common[]>(() => {
    return locationData.value.flatMap((location) => {
      // The API returns a serialized PHP Array sometimes
      // TODO: remove PHP parsing code once API reliably returns arrays
      // TODO: remove closed_days processing entirely once availability status contains location-closed info
      const closedDays = Array.isArray(location.closed_days)
        ? location.closed_days
        : parseSerializedPHPArray<APIDay>(location.closed_days);
      return location.items.map((item) => ({
        id: item.id.toString(),
        locationId: createLocationId(location),
        categoryIds: item.terms.filter((id) => configuredCategoryIds.includes(id)),
        name: item.name,
        description: item.short_desc,
        url: item.link,
        images: Object.values(item.images ?? {})
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
        availabilities: Object.fromEntries(
          (item.availability ?? []).map((a) => {
            const date = parseISO(a.date);
            // date.getDay is 0-indexed starting on Sunday.
            // closed_days is 1-indexed starting on Monday.
            const day = (date.getDay() === 0 ? 7 : date.getDay()).toString();
            const status: CommonAvailabilityStatus =
              a.status === 'locked' && closedDays.includes(day as APIDay)
                ? ('location-closed' as const)
                : a.status;
            return [a.date, { status, date }];
          }),
        ),
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

  const initialLoadingStates: LoadingState[] = [
    'categoryGroups',
    'categories',
    'commons',
    'locations',
  ];

  const locationData = ref<APILocation[]>([]);
  const loading = ref(new Set<LoadingState>(initialLoadingStates));

  async function init() {
    const maxRetries = 10;
    const retryWaitTime = 1.5;
    let retry = 0;

    while (retry++ < maxRetries) {
      loading.value = new Set(initialLoadingStates);
      try {
        locationData.value = await fetchLocationData(dataSource);
        loading.value.clear();
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
    loading,
    ...useAdminAjaxData(config, locationData),
  });
}
