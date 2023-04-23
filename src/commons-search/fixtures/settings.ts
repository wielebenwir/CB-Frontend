import { addDays } from 'date-fns';
import { toDateString } from '../../util';
import { CommonMarkerIconConfig, MarkerIconConfig, ExtendedLegacyMapConfiguration } from '../types';
import LightningIcon from './lightning.svg?url';
import HandIcon from './hand.svg?url';

const markerIcon: CommonMarkerIconConfig = {
  renderers: [
    {
      type: 'category',
      matchers: [
        {
          categories: [29],
          renderers: { type: 'image', url: LightningIcon },
        },
        {
          categories: [31],
          renderers: {
            type: 'color',
            color: 'hsl(230 60% 80%)',
          },
        },
      ],
    },
    { type: 'thumbnail' },
  ],
  wrapDefaults: { scale: 0.75 },
};

const userMarkerIcon: MarkerIconConfig = {
  renderers: [{ type: 'image', url: HandIcon }],
};

export default {
  version: 1,
  dataSource: { type: 'fixtures' },
  custom_marker_icon: null,
  item_draft_marker_icon: null,
  preferred_status_marker_icon: 'publish',
  filter_cb_item_categories: {
    'g1610805575766-21823': {
      name: '',
      elements: [
        {
          cat_id: 27,
          markup: '2 Räder',
        },
        {
          cat_id: 28,
          markup: '3 Räder',
        },
        {
          cat_id: 35,
          markup: 'Gespann',
        },
      ],
    },
    'g1610805862646-605141': {
      name: 'Antrieb',
      elements: [
        {
          cat_id: 29,
          markup: 'Elektro',
        },
        {
          cat_id: 30,
          markup: 'Muskelkraft',
        },
      ],
    },
    'g1610805870910-325344': {
      name: '',
      elements: [
        {
          cat_id: 31,
          markup: 'Kiste mit Schloss',
        },
        {
          cat_id: 32,
          markup: 'Regenverdeck',
        },
      ],
    },
    'g1610805880437-723630': {
      name: '',
      elements: [
        {
          cat_id: 34,
          markup: 'Kindertransport',
        },
        {
          cat_id: 33,
          markup: 'Rollstuhl',
        },
      ],
    },
  },
  filter_availability: {
    date_min: toDateString(new Date()),
    date_max: toDateString(addDays(new Date(), 31)),
    day_count_max: '20',
  },
  cb_map_id: 7561,
  locale: 'de-DE',
  asset_path: 'https://stage3.commons-booking.org/wp-content/plugins/commonsbooking/assets/map/',
  base_map: 1,
  show_scale: false,
  zoom_min: 9,
  zoom_max: 19,
  scrollWheelZoom: true,
  zoom_start: 11,
  lat_start: 50.953128,
  lon_start: 6.945275,
  marker_map_bounds_initial: false,
  marker_map_bounds_filter: false,
  max_cluster_radius: 80,
  marker_tooltip_permanent: false,
  show_location_contact: false,
  show_location_opening_hours: false,
  show_item_availability: true,
  show_location_distance_filter: true,
  label_location_distance_filter: '',
  show_item_availability_filter: false,
  label_item_availability_filter: 'Verfügbarkeit',
  label_item_category_filter: 'Merkmale',
  map: {
    markerIcon,
    userMarkerIcon,
  },
  geocode: {
    region: { countryCodes: ['de'] },
  },
} as ExtendedLegacyMapConfiguration;
