import { createApp } from 'vue';
import { createI18n } from '@rokoli/vue-tiny-i18n';
import '../style.css';
import translations from './translations';

import CBCommonsSearch from './components/CBCommonsSearch.vue';
import type {
  CommonCategory,
  CommonCategoryGroup,
  CommonsSearchAPI,
  CommonsSearchConfiguration,
  ExtendedLegacyMapConfiguration,
  GeocodeConfig,
  MarkerIconConfig,
} from './types';
import { CommonMarkerIconConfig } from './types';

export { createAdminAjaxAPI } from './apis/admin-ajax-api';

export function init(
  element: HTMLElement,
  api: CommonsSearchAPI,
  config: CommonsSearchConfiguration,
) {
  const i18n = createI18n({
    locale: config.i18n.locale,
    fallbackLocales: ['en'],
    messages: config.i18n.messages ? [translations, config.i18n.messages] : [translations],
  });
  const app = createApp(CBCommonsSearch, { api, config });
  app.use(i18n);
  app.mount(element);
  return app;
}

// The value of this is replaced at build-time.
export const version = '__CB_FRONTEND_VERSION__';

export function parseLegacyConfig(
  config: ExtendedLegacyMapConfiguration,
): CommonsSearchConfiguration {
  function parseCategoryGroups(): CommonCategoryGroup[] {
    return Object.entries(config.filter_cb_item_categories).map(([id, { name }]) => ({
      id,
      name,
    }));
  }

  function parseCategories(): CommonCategory[] {
    return Object.entries(config.filter_cb_item_categories).flatMap(([groupId, { elements }]) => {
      return elements.map((category) => ({
        id: category.cat_id,
        groupId,
        name: category.markup,
      }));
    });
  }

  function parseCustomMarkerIcon(): { markerIcon?: CommonMarkerIconConfig } {
    if (!config.custom_marker_icon) return {};
    const { iconUrl, iconSize, iconAnchor } = config.custom_marker_icon;
    const [width, height] = iconSize;
    const [x, y] = iconAnchor;
    return {
      markerIcon: {
        renderers: [
          { type: 'icon', url: iconUrl, width, height, anchor: { x: x / width, y: y / height } },
        ],
      },
    };
  }

  function parseMapMarker() {
    const result: { markerIcon?: CommonMarkerIconConfig; userMarkerIcon?: MarkerIconConfig } = {};
    if (config.map?.markerIcon) {
      result.markerIcon = config.map.markerIcon;
    }
    if (config.map?.userMarkerIcon) {
      result.userMarkerIcon = config.map.userMarkerIcon;
    }
    return result;
  }

  function parseMapConfig(): CommonsSearchConfiguration['map'] {
    return {
      tileServerApi: {
        url: [
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
          'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
          'https://tiles.lokaler.de/osmbright-20171212/{z}/{x}/{y}/tile@1x.jpeg',
        ][config.base_map],
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors - <a href="https://www.openstreetmap.org/copyright">License</a>',
      },
      zoom: {
        start: config.zoom_start,
        min: config.zoom_min,
        max: config.zoom_max,
      },
      center: { lat: config.lat_start, lng: config.lon_start },
      cluster: { radiusPixels: config.max_cluster_radius },
      ...parseCustomMarkerIcon(),
      ...parseMapMarker(),
    };
  }

  function parseGeocodeConfig(): { geocode?: GeocodeConfig } {
    if (!config.show_location_distance_filter) return {};
    let countryCodes = config.geocode?.region?.countryCodes;
    if (!countryCodes) {
      const localeParts = config.locale.split('-');
      if (localeParts.length >= 2) {
        countryCodes = [localeParts[1].toLowerCase()];
      }
    }
    return {
      geocode: {
        nominatimSearchApi: config.geocode?.nominatimSearchApi ?? {
          url: 'https://nominatim.openstreetmap.org/search',
          attribution:
            'Address search by <a href="https://nominatim.openstreetmap.org/">Nominatim</a>',
        },
        removeNeighboringLocationsWithinMeters:
          config?.geocode?.removeNeighboringLocationsWithinMeters ?? 30,
        region: {
          ...(config.geocode?.region ?? {}),
          countryCodes,
        },
      },
    };
  }

  return {
    version: 2,
    i18n: {
      locale: config.locale,
      messages: {
        [config.locale.replace(/-/g, '_')]: {
          CBCommonFilter: {
            unlabelledCategoryRenderGroup: config.label_item_category_filter,
          },
        },
      },
    },
    filter: {
      availability: {
        dateRange: {
          start: config.filter_availability.date_min,
          end: config.filter_availability.date_max,
        },
      },
      categoryGroups: parseCategoryGroups(),
      categories: parseCategories(),
    },
    map: parseMapConfig(),
    ...parseGeocodeConfig(),
  };
}
