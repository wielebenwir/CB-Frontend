import { MapConfiguration } from '../types';

export default {
  data_source: 'fixtures',
  data_url: 'https://stage3.commons-booking.org/wp-admin/admin-ajax.php',
  nonce: '08172e7a0d',
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
      name: '',
      elements: [
        {
          cat_id: 29,
          markup: 'mit Elektro',
        },
        {
          cat_id: 30,
          markup: 'reine Muskelkraft',
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
    date_min: '2023-03-20',
    date_max: '2023-03-31',
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
  show_location_distance_filter: false,
  label_location_distance_filter: '',
  show_item_availability_filter: false,
  label_item_availability_filter: 'Verfügbarkeit',
  label_item_category_filter: 'Merkmale',
} as MapConfiguration;
