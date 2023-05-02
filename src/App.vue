<template>
  <div ref="rootEl" class="tw-box-border md:tw-p-6 md:tw-h-[100dvh]"></div>

  <button
    type="button"
    class="cb-btn tw-gray-100 tw-shadow-lg tw-fixed tw-top-3 tw-right-3 tw-bg-white md:tw-top-9 md:tw-right-9"
    @click="showConfigurationDialog = true"
  >
    Edit Configuration
  </button>

  <CBDialog
    v-model:is-open="showConfigurationDialog"
    class="tw-max-w-3xl"
    title="Edit Configuration"
  >
    <div class="tw-flex-1 tw-min-h-0 tw-px-4 tw-overflow-y-auto tw-max-w-full">
      <textarea
        v-model="userConfiguration"
        rows="30"
        class="cb-input tw-border tw-border-gray-100 tw-font-mono tw-w-full tw-box-border tw-mb-4"
        @blur="updateConfiguration"
      />
    </div>
  </CBDialog>
</template>

<script lang="ts" setup>
import { init as createCommonsSearch, parseLegacyConfig } from './commons-search';
import { createFixturesAPI } from './commons-search/apis/fixtures-api';
import { App, ref, watchEffect } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import _configuration from './commons-search/fixtures/settings';
import { CommonsSearchConfiguration } from './commons-search/types';
import CBDialog from './commons-search/components/CBDialog.vue';

let app: App;
const rootEl = ref<HTMLElement>();
const showConfigurationDialog = ref(false);
const configuration = ref<CommonsSearchConfiguration>(
  parseLegacyConfig({
    ..._configuration,
    map: {
      markerIcon: {
        renderers: [
          { type: 'thumbnail' },
          { type: 'color', color: 'var(--commonsbooking-map-marker-default-embed-fill)' },
        ],
      },
      userMarkerIcon: {
        renderers: [{ type: 'color', color: 'var(--commonsbooking-map-marker-user-embed-fill)' }],
      },
    },
  }),
);
const userConfiguration = ref(JSON.stringify(configuration.value, null, 2));
function updateConfiguration() {
  try {
    configuration.value = JSON.parse(userConfiguration.value);
  } catch (err) {
    console.error('Could not parse configuration', err);
  }
}

watchEffect(() => {
  if (app) app.unmount();
  if (rootEl.value) {
    app = createCommonsSearch(
      rootEl.value as HTMLElement,
      createFixturesAPI(configuration.value),
      configuration.value,
    );
  }
});
</script>

<style>
:root {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    Segoe UI Symbol, 'Noto Color Emoji';
  font-feature-settings: normal;
  font-variation-settings: normal;
}

body {
  margin: 0;
}
</style>
