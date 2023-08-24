import haversine from 'haversine-distance';
import type { LatLngBounds as LatLngBoundsType } from 'leaflet';
import { ref, Ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import {
  Common,
  CommonLocation,
  GeocodeConfig,
  GeoCoordinate,
  IdMap,
  ValueWithUnit,
} from './types';
import { HTTPAPIError } from './apis';
import { delay } from '../util';
import type { LatLngTuple } from 'leaflet';

const NOMINATIM_REQUEST_INTERVAL_SECONDS = 1;
const USER_AGENT = 'CommonsBooking <https://github.com/wielebenwir/commonsbooking>';

export type GeoLocation = GeoCoordinate & {
  id: number;
  name: string;
};

type PoorlyTypedGeoCoordinate = { lat: string | number; lon: string | number };

// This is only a partial type definition of the fields we actually use.
type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  class: string;
  address: {
    house_number?: string;
    road?: string;
    county?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
};

export function coordinateToLatLngTuple(c: GeoCoordinate): LatLngTuple {
  return [c.lat, c.lng];
}

function getDistanceInMeters(a: PoorlyTypedGeoCoordinate, b: PoorlyTypedGeoCoordinate) {
  const ensureFloat = (v: string | number) => (typeof v === 'number' ? v : parseFloat(v));
  return haversine(
    { lat: ensureFloat(a.lat), lon: ensureFloat(a.lon) },
    { lat: ensureFloat(b.lat), lon: ensureFloat(b.lon) },
  );
}

export function calculateDistance(
  a: GeoCoordinate,
  b: GeoCoordinate,
  approximateToMeters = 50,
): ValueWithUnit<number> {
  const distance = haversine(a, b);
  const approximateDistance = Math.ceil(distance / approximateToMeters) * approximateToMeters;
  return approximateDistance >= 1000
    ? { value: approximateDistance / 1000, unit: 'km' }
    : { value: approximateDistance, unit: 'm' };
}

function scoreNominatimResult(location: NominatimResult) {
  let score = 0;
  if (location.address.state) score += 1;
  if (location.address.city || location.address.county) score += 1;
  if (location.address.postcode) score += 1;
  if (location.address.road) score += 1;
  if (location.address.house_number) score += 1;
  if (location.class === 'building') score += 2;
  if (location.class === 'place') score += 1;
  return score;
}

export function filterNeighboringNominatimResults(
  locations: NominatimResult[],
  maxDistanceMeters: number,
  scoreLocation: (location: NominatimResult) => number = scoreNominatimResult,
): NominatimResult[] {
  const result: NominatimResult[] = [];
  const locationsMap = new Map(locations.map((item) => [item.place_id, item]));

  while (locationsMap.size > 0) {
    for (const location of locationsMap.values()) {
      // Find all locations that are within the radius of the provided maxDistance
      // for the currently selected location.
      const neighboringLocations = Array.from(locationsMap.values()).filter((l) => {
        if (location.place_id === l.place_id) return false;
        return getDistanceInMeters(location, l) <= maxDistanceMeters;
      });

      // Find the most relevant location of all the locations
      // in the defined radius based on the location score.
      const [relevantLocation] = neighboringLocations.reduce(
        ([currentLocation, currentScore], location) => {
          const locationScore = scoreLocation(location);
          return locationScore > currentScore
            ? [location, locationScore]
            : [currentLocation, currentScore];
        },
        [location, scoreLocation(location)],
      );

      // Keep the relevant location and delete all other locations
      // from the locationsMap to avoid further processing.
      result.push(relevantLocation);
      locationsMap.delete(location.place_id);
      for (const location of neighboringLocations) {
        locationsMap.delete(location.place_id);
      }
    }
  }

  return result;
}

export function processNominatimResults(data: NominatimResult[]): GeoLocation[] {
  function prefix(str1: string, str2: string | undefined, glue: string) {
    if (str2) {
      return !str1 ? str2 : `${str2}${glue}${str1}`;
    }
    return str1;
  }

  return data.map((item) => {
    const { house_number, road, city, county, state, postcode } = item.address;
    let street = house_number ?? '';
    street = prefix(street, road, ' ');
    let name = state ?? '';
    name = prefix(name, city ?? county, ', ');
    name = prefix(name, postcode, ' ');
    name = prefix(name, street, ', ');
    return {
      id: item.place_id,
      name: name ? name : item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
  });
}

export async function geocodeAddress(
  queryOrStreet: string,
  config: GeocodeConfig,
): Promise<NominatimResult[]> {
  const url = config.nominatimSearchApi.url;

  const params = new URLSearchParams();
  params.set('format', 'json');
  // cspell:disable-next-line
  params.set('addressdetails', '1');
  const { city, county, postalCode, countryCodes, state } = config?.region ?? {};
  // cspell:disable-next-line
  countryCodes && params.set('countrycodes', countryCodes.join(','));

  if (city || county || postalCode || state) {
    city && params.set('city', city);
    county && params.set('county', county);
    // cspell:disable-next-line
    postalCode && params.set('postalcode', postalCode);
    state && params.set('state', state);
    params.set('street', queryOrStreet);
  } else {
    params.set('q', queryOrStreet);
  }
  const res = await fetch(`${url}?${params.toString()}`, {
    headers: {
      Referer: window.location.origin,
      'User-Agent': USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new HTTPAPIError(res, 'Could not geocode address');
  }

  const data = await res.json();
  return data.map((item: NominatimResult & { lat: string; lon: string }) => ({
    ...item,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}

async function haltForNominatimAPIRequestLimit(lastRequestDate: Date) {
  const now = new Date();
  const secondsSinceLastRequest = (now.getTime() - lastRequestDate.getTime()) / 1000;
  if (secondsSinceLastRequest < NOMINATIM_REQUEST_INTERVAL_SECONDS) {
    const waitTime = NOMINATIM_REQUEST_INTERVAL_SECONDS - secondsSinceLastRequest;
    await delay(waitTime);
  }
}

export function useGeoCoder(queryOrStreet: Ref<string>, geocodeConfig: GeocodeConfig) {
  let lastRequestDate = new Date();
  const locations = ref<GeoLocation[]>([]);
  const error = ref<Error>();
  const isLoading = ref<boolean>(false);

  watchDebounced(
    queryOrStreet,
    async (value: string) => {
      isLoading.value = true;
      try {
        await haltForNominatimAPIRequestLimit(lastRequestDate);
        let results = await geocodeAddress(value, geocodeConfig);
        lastRequestDate = new Date();
        const removeNeighboringLocationsWithinMeters =
          geocodeConfig?.removeNeighboringLocationsWithinMeters ?? 30;
        if (removeNeighboringLocationsWithinMeters) {
          results = filterNeighboringNominatimResults(
            results,
            removeNeighboringLocationsWithinMeters,
          );
        }
        locations.value = processNominatimResults(results);
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
      } finally {
        isLoading.value = false;
      }
    },
    { debounce: 500 },
  );

  return { error, locations, isLoading };
}

export function useCurrentLocation(currentPositionLabel: string) {
  const isSupported = 'geolocation' in navigator;
  async function getCurrentLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            id: -1,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: currentPositionLabel,
          });
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  return { isSupported, getCurrentLocation };
}

export function getCoordinates(
  commons: Common[],
  locationMap: IdMap<CommonLocation>,
  userLocation?: GeoCoordinate | null,
) {
  const points: LatLngTuple[] = commons
    .map(({ locationId }) => {
      const location = locationMap.get(locationId);
      return location ? coordinateToLatLngTuple(location.coordinates) : null;
    })
    .filter((point): point is LatLngTuple => point !== null);

  if (userLocation) {
    points.push(coordinateToLatLngTuple(userLocation));
  }
  return points;
}

export function getCoordinatesCenter(coords: LatLngTuple[]) {
  if ('L' in globalThis && globalThis.L.LatLngBounds) {
    const LatLngBounds = globalThis.L.LatLngBounds as typeof LatLngBoundsType;
    const bounds = new LatLngBounds(coords);
    return bounds.getCenter() as GeoCoordinate;
  }
  return null;
}
