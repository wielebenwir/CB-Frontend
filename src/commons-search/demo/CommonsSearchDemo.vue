<template>
  <div class="tw-flex tw-gap-2 tw-w-fit tw-mx-auto tw-p-6">
    <label
      v-for="name in layoutNames"
      :key="name"
      class="cb-btn"
      :class="layoutType === name ? 'tw-bg-active' : 'tw-bg-base-1'"
      :title="t(`layout.${name}`)"
    >
      <input type="radio" name="layoutType" :value="name" v-model="layoutType" class="tw-hidden" />
      {{ t(`layout.${name}`) }}
    </label>

    <span class="tw-w-px tw-bg-gray-200" role="separator" />

    <button type="button" class="cb-btn tw-bg-base-1" @click="showConfigurationDialog = true">
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
const layoutType = ref<LayoutType>('CalendarAndFilterWithOptionalMap');
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
    layout: { type: layoutType.value },
  };
});
const usesLargeArea = computed(() => layoutType.value === 'LargeMapWithFilterSidebar');

watchEffect(async () => {
  if (app) {
    await app.unmount();
  }
  if (initEl.value instanceof HTMLElement) {
    init(initEl.value, api, configuration.value);
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
  .demo {
    width: 960px;
    padding: 1.5rem;
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
  numberLocations: Anzahl der Ausleihstationen
  layout:
    CalendarAndFilterWithOptionalMap: Verfügbarkeitskalender mit Filter
    LargeMapWithFilterSidebar: Karte mit Seitenleiste
    ListWithFilter: Artikelliste mit Filter

en:
  editConfiguration: Edit Configuration
  numberLocations: Number of lending stations
  layout:
    CalendarAndFilterWithOptionalMap: Availability calendar with filter
    LargeMapWithFilterSidebar: Map with sidebar
    ListWithFilter: Article list with filter
</i18n>
