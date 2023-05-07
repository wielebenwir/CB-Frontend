<template>
  <div ref="rootEl" class="tw-box-border md:tw-p-6"></div>

  <button
    type="button"
    class="cb-btn tw-bg-base-0 tw-shadow-lg tw-absolute tw-top-3 tw-right-3 md:tw-top-9 md:tw-right-9"
    @click="showConfigurationDialog = true"
  >
    {{ t('editConfiguration') }}
  </button>

  <CBDialog
    v-model:is-open="showConfigurationDialog"
    class="tw-max-w-3xl"
    :title="t('editConfiguration')"
  >
    <div class="tw-flex-1 tw-min-h-0 tw-px-4 tw-overflow-y-auto tw-max-w-full">
      <label class="tw-flex tw-flex-col tw-mb-3">
        <span>{{ t('numberLocations') }}</span>
        <input
          type="text"
          class="cb-input tw-border tw-border-base-2"
          inputmode="numeric"
          pattern="[0-9]+"
          :value="isNaN(numLocations) ? '' : numLocations"
          @blur="numLocations = parseInt(($event.target as HTMLInputElement).value ?? '')"
        />
      </label>
      <textarea
        v-model="userConfiguration"
        rows="30"
        class="cb-input tw-border tw-border-base-1 tw-font-mono tw-w-full tw-box-border tw-mb-4"
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
import { useI18n } from '@rokoli/vue-tiny-i18n';

let app: App;
const { t } = useI18n();
const rootEl = ref<HTMLElement>();
const showConfigurationDialog = ref(false);
const numLocations = ref<number>(30);
const configuration = ref<CommonsSearchConfiguration>(
  parseLegacyConfig({
    ..._configuration,
    map: {
      markerIcon: {
        renderers: [
          { type: 'thumbnail' },
          { type: 'color', color: 'var(--cb-map-marker-default-embed-fill)' },
        ],
      },
      userMarkerIcon: {
        renderers: [{ type: 'color', color: 'var(--cb-map-marker-user-embed-fill)' }],
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
      createFixturesAPI({ numLocations: numLocations.value }, configuration.value),
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

  /* cspell:disable */
  --commonsbooking-color-primary: #84ae53;
  --commonsbooking-color-secondary: #506ca9;
  --commonsbooking-color-buttons: #74ce3c;
  --commonsbooking-color-accept: #74ce3c;
  --commonsbooking-color-cancel: #d5425c;
  --commonsbooking-color-holiday: #ff9218;
  --commonsbooking-color-greyedout: #e0e0e0;
  --commonsbooking-color-bg: #f9f9f9;
  --commonsbooking-color-noticebg: #fff9c5;
  --commonsbooking-textcolor-light: #c4c4c4;
  --commonsbooking-textcolor-dark: #000;
  --commonsbooking-color-gray-background: #f9f9f9;
  --commonsbooking-color-gray-border: #f6f6f6;
  --commonsbooking-color-error: #d5425c;
  --commonsbooking-color-success: #74ce3c;
  --commonsbooking-color-warning: #ff9218;
  --commonsbooking-font-size-small: 12px;
  --commonsbooking-font-line-height-small: 13px;
  --commonsbooking-font-size-normal: 14px;
  --commonsbooking-font-size-big: 18px;
  --commonsbooking-font-size-huge: 24px;
  --commonsbooking-spacer-big: 15px;
  --commonsbooking-spacer: 10px;
  --commonsbooking-spacer-small: 5px;
  --commonsbooking-radius: 8px;
  --commonsbooking-radius-pill: 8px;
  /* cspell:enable */
}

body {
  margin: 0;
}
</style>

<i18n lang="yaml">
de:
  editConfiguration: Konfiguration bearbeiten
  numberLocations: Anzahl der Ausleihstationen

en:
  editConfiguration: Edit Configuration
  numberLocations: Number of lending stations
</i18n>
