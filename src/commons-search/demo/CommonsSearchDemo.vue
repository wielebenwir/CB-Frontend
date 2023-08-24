<template>
  <div class="demo-ctl tw-flex tw-flex-wrap tw-gap-2 tw-w-fit tw-py-6 tw-mx-auto">
    <button
      type="button"
      class="cb-btn md:tw-ml-auto tw-bg-base-1"
      @click="showConfigurationDialog = true"
    >
      {{ t('editConfiguration') }}
    </button>
  </div>

  <div class="demo">
    <header class="tw-bg-gray-100" style="grid-area: header" />
    <aside v-if="!usesLargeArea" class="tw-bg-gray-100" style="grid-area: sidebar" />
    <main
      class="tw-flex tw-flex-col tw-pb-12"
      :style="{
        'grid-area': usesLargeArea ? 'sidebar / sidebar /content / content' : 'content',
      }"
    >
      <h1 class="tw-mt-0">Freie Lastenräder in Köln</h1>
      <div ref="initEl"></div>
    </main>
  </div>

  <CBDialog
    v-model:is-open="showConfigurationDialog"
    class="tw-max-w-3xl"
    :title="t('editConfiguration')"
  >
    <div class="tw-flex-1 tw-min-h-0 tw-px-4 tw-overflow-y-auto tw-max-w-full">
      <label class="tw-flex tw-flex-col tw-mb-3">
        <span>{{ t('layoutLabel') }}</span>
        <input
          type="text"
          class="cb-input tw-border tw-bg-base-1 tw-border-base-2"
          :value="layoutType"
          @blur="layoutType = ($event.target as HTMLInputElement).value ?? 'FilterableMap'"
        />
        <span class="tw-text-xs tw-mt-1">
          {{ t('layoutHelp', { availableLayouts: layoutNames.join(', ') }) }}
        </span>
      </label>

      <label class="tw-flex tw-flex-col tw-mb-3">
        <span>{{ t('numberLocationsLabel') }}</span>
        <input
          type="text"
          class="cb-input tw-border tw-bg-base-1 tw-border-base-2"
          inputmode="numeric"
          pattern="[0-9]+"
          :value="isNaN(numLocations) ? '' : numLocations"
          @blur="numLocations = parseInt(($event.target as HTMLInputElement).value ?? '')"
        />
      </label>

      <textarea
        v-model.lazy="userConfiguration"
        rows="30"
        class="cb-input tw-border tw-border-base-1 tw-font-mono tw-w-full tw-box-border tw-mb-4"
      />
    </div>
  </CBDialog>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { App, computed, ref, watchEffect } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { init, parseLegacyConfig } from '..';
import { createFixturesAPI } from '../apis/fixtures-api';
import _configuration from '../fixtures/settings';
import { CommonsSearchConfiguration } from '../types';
import CBDialog from '../components/CBDialog.vue';
import { LayoutType, layoutNames } from '../layouts';

let app: App;
const { t } = useI18n();
const initEl = ref<HTMLDivElement>();
const showConfigurationDialog = ref(false);
const numLocations = ref<number>(30);
const layoutType = ref<string>('FilterableMap');
const parsedConfiguration = ref<CommonsSearchConfiguration>(
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
const api = createFixturesAPI({ numLocations: numLocations.value }, parsedConfiguration.value);
const userConfiguration = computed<string>({
  get() {
    return JSON.stringify(parsedConfiguration.value, null, 2);
  },
  set() {
    console.log('updating config');
    try {
      parsedConfiguration.value = JSON.parse(userConfiguration.value);
    } catch (err) {
      console.error('Could not parse configuration', err);
    }
  },
});
const configuration = computed<CommonsSearchConfiguration>(() => {
  return {
    ...parsedConfiguration.value,
    layout: {
      types: layoutType.value.split(',').map((t) => t.trim()) as LayoutType[],
      options: [],
    },
  };
});
const usesLargeArea = computed(() => layoutType.value === 'LargeMapWithStaticSidebar');

watchEffect(async () => {
  if (app) {
    app.unmount();
  }
  if (initEl.value instanceof HTMLElement) {
    app = init(initEl.value, api, configuration.value);
  }
});
</script>

<style lang="postcss" scoped>
.demo {
  display: grid;
  gap: 1.5rem;
  grid-template-areas: 'header' 'sidebar' 'content';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 150px 0 max-content;
}

@media (min-width: 960px) {
  .demo,
  .demo-ctl {
    width: 960px;
  }

  .demo {
    margin-inline: auto;
    grid-template-areas: 'header header' 'sidebar content';
    grid-template-columns: 234px minmax(0, 1fr);
    grid-template-rows: 150px max-content;
  }
}
</style>

<i18n lang="yaml">
de:
  editConfiguration: Konfiguration bearbeiten
  numberLocationsLabel: Anzahl der Ausleihstationen
  layoutLabel: Layout
  layoutHelp: Komma-separierte Liste. Wähle aus {availableLayouts}.

en:
  editConfiguration: Edit Configuration
  numberLocationsLabel: Number of lending stations
  layoutLabel: Layout
  layoutHelp: Comma-separated list. Choose from {availableLayouts}.
</i18n>
