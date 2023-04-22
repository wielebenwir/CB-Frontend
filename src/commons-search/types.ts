import type { CamelCasedPropertiesDeep } from 'type-fest';
import type { ComputedRef, UnwrapNestedRefs } from 'vue';

type CustomIconAttributes = { width: number; height: number; anchor: { x: number; y: number } };
export type CustomIcon = { url: string } & CustomIconAttributes;
type IconWrapperTemplate = { source: string } & CustomIconAttributes;
export type IconWrapper = {
  template?: IconWrapperTemplate;
  fill?: string;
  embedFill?: string;
  scale?: number;
};
type CategoryMatcher = {
  categories: number[];
  renderers: MarkerIconRenderer | MarkerIconRenderer[];
  wrap?: IconWrapper;
};
type ThumbnailRenderer = { type: 'thumbnail'; wrap?: IconWrapper };
type CategoryRenderer = { type: 'category'; matchers: CategoryMatcher[]; wrap?: IconWrapper };
type StaticImageRenderer = { type: 'image'; url: string; wrap?: IconWrapper };
type ColorIconRenderer = { type: 'color'; color: string; wrap?: IconWrapper };
type IconRenderer = { type: 'icon' } & CustomIcon;
type TraditionalIconRenderer = { type: 'traditional-icon' };
export type MarkerIconRenderer =
  | StaticImageRenderer
  | IconRenderer
  | ColorIconRenderer
  | TraditionalIconRenderer;
export type CommonMarkerIconRenderer = ThumbnailRenderer | CategoryRenderer | MarkerIconRenderer;

export type MarkerIconConfig = {
  renderers: MarkerIconRenderer[];
  wrapDefaults?: IconWrapper;
};

export type CommonMarkerIconConfig = {
  renderers: CommonMarkerIconRenderer[];
  wrapDefaults?: IconWrapper;
};

export type CommonsSearchConfiguration = {
  data_source?: 'admin-ajax' | 'fixtures';
  data_url: string;
  nonce: string;
  cb_map_id: number;
  custom_marker_icon: {
    iconUrl: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  } | null;
  item_draft_marker_icon: unknown;
  preferred_status_marker_icon: string;
  filter_cb_item_categories: Record<
    string,
    {
      name: string;
      elements: {
        cat_id: number;
        markup: string;
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
  show_location_distance_filter: boolean;
  label_location_distance_filter: string;
  show_item_availability_filter: boolean;
  label_item_availability_filter: string;
  label_item_category_filter: string;
  layout?: {
    expand_filter?: boolean;
  };
  map?: {
    markerIcon?: CommonMarkerIconConfig;
    userMarkerIcon?: MarkerIconConfig;
  };
  geocode?: {
    nominatim_endpoint?: string;
    remove_neighboring_locations_within_meters?: number | false;
    region?: {
      city?: string;
      postalCode?: string;
      county?: string;
      state?: string;
      countryCodes?: string[];
    };
  };
};

export type ParsedCommonsSearchConfiguration = CamelCasedPropertiesDeep<CommonsSearchConfiguration>;

export type Image = {
  url: string;
  width: number;
  height: number;
  description?: string;
};

export type CommonAvailabilityStatus = 'available' | 'booked' | 'partially-booked' | 'locked';
export type CommonAvailability = { status: CommonAvailabilityStatus; date: Date };

export type Common = {
  id: number;
  locationId: string;
  categoryIds: number[];
  name: string;
  description: string;
  url: string;
  images: Image[];
  availabilities: CommonAvailability[];
};

export type CommonCategory = {
  id: number;
  name: string;
  groupId: string;
};

export type CommonCategoryGroup = {
  id: string;
  name: string;
};

export type GeoCoordinate = {
  lat: number;
  lng: number;
};

export type CommonLocation = {
  id: string;
  name: string;
  coordinates: GeoCoordinate;
  address: {
    postalCode: string;
    street: string;
    city: string;
  };
};

export type ValueWithUnit<T> = {
  value: T;
  unit: string;
};

interface _CommonsSearchAPI {
  init(): Promise<void>;
  type: string;
  commons: ComputedRef<Common[]>;
  categories: ComputedRef<CommonCategory[]>;
  categoryGroups: ComputedRef<CommonCategoryGroup[]>;
  locations: ComputedRef<CommonLocation[]>;
}

export type CommonsSearchAPI = UnwrapNestedRefs<_CommonsSearchAPI>;
