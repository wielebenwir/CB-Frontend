import type { CamelCasedPropertiesDeep } from 'type-fest';
import type { ComputedRef, UnwrapNestedRefs } from 'vue';

export type MapConfiguration = {
  data_source?: 'admin-ajax' | 'fixtures';
  data_url: string;
  nonce: string;
  cb_map_id: number;
  custom_marker_icon: {
    iconUrl: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  };
  item_draft_marker_icon: unknown;
  preferred_status_marker_icon: string;
  filter_cb_item_categories: Record<
    string,
    {
      name: string;
      elements: {
        cat_id: number;
        markup: string;
        color: string;
      }[];
    }
  >;
  filter_availability: {
    date_min: string;
    date_max: string;
    day_count_max: string;
  };
  locale: string;
  asset_path: string;
  base_map: number;
  show_scale: boolean;
  enable_map_data_export: boolean;
  zoom_min: number;
  zoom_max: number;
  zoom_start: number;
  lat_start: number;
  lon_start: number;
  marker_map_bounds_initial: boolean;
  marker_map_bounds_filter: boolean;
  max_cluster_radius: number;
  marker_tooltip_permanent: boolean;
  show_location_contact: boolean;
  show_location_opening_hours: boolean;
  show_item_availability: boolean;
  marker_cluster_icon: {
    url: string;
    size: {
      width: number;
      height: number;
    };
  };
  show_location_distance_filter: boolean;
  label_location_distance_filter: string;
  show_item_availability_filter: boolean;
  label_item_availability_filter: string;
  label_item_category_filter: string;
  custom_category_colors_text: boolean;
  custom_category_colors_marker_icon: boolean;
};

export type ParsedMapConfiguration = CamelCasedPropertiesDeep<MapConfiguration>;

export type Location = {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  address: {
    postalCode: string;
    street: string;
    city: string;
  };
};

interface _MapDataAPI {
  init(): Promise<void>;
  type: string;

  locations: ComputedRef<Location[]>;
}

export type MapDataAPI = UnwrapNestedRefs<_MapDataAPI>;
