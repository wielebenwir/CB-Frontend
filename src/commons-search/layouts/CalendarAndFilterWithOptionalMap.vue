<template>
  <div class="cb-app cb-commons-search tw-grid">
    <CBCommonFilter
      v-model:categories="filter.categories"
      v-model:user-location="filter.userLocation"
      v-model:available-between="filter.availableBetween"
      v-model:available-today="filter.availableToday"
      class="tw-bg-base-1 tw-rounded tw-mb-6"
      :api="api"
      :config="config"
      style="grid-area: filter"
      @reset="resetFilters"
    >
      <button
        type="button"
        class="cb-btn tw-bg-base-2"
        :aria-label="showMap ? t('hideMap') : t('showMap')"
        @click="showMap = !showMap"
      >
        <IconMapMarker />
        <span class="tw-sr-only md:tw-not-sr-only">
          {{ showMap ? t('hideMap') : t('showMap') }}
        </span>
      </button>
    </CBCommonFilter>

    <div
      v-if="showMap"
      class="tw-flex tw-flex-col md:tw-flex-row tw-mb-6 tw-rounded tw-overflow-hidden"
      style="grid-area: map"
    >
      <CBCommonList
        v-if="filter.location"
        class="tw-isolate tw-z-10 tw-bg-base-1 md:tw-mb-6"
        :categories="api.categories"
        :commons="filteredAndSortedCommons"
        :location-map="locationMap"
        :selected-location="filter.location"
        :user-location="filter.userLocation"
        :page-size="10"
        @deselect-location="filter.location = null"
      />

      <CBMap
        v-if="config.map !== undefined"
        ref="map"
        v-model:center="filter.mapCenter"
        class="tw-isolate tw-z-0 tw-h-full tw-w-full"
        :commons="filteredCommons"
        :location-map="locationMap"
        :user-location="filter.userLocation"
        :config="{ map: config.map, geocode: config.geocode }"
        @select="filter.location = $event"
      />
    </div>

    <div class="tw-isolate tw-z-0" style="grid-area: acal">
      <CBAvailabilityCalendar :commons="filteredCommons" :location-map="locationMap" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, ref } from 'vue';
import { IconMapMarker } from '../../icons';
import { useGlobalState } from '../state';
import { CommonsSearchAPI, CommonsSearchConfiguration } from '../types';
import CBCommonFilter from '../components/CBCommonFilter.vue';
import CBCommonList from '../components/CBCommonList.vue';
import CBMap from '../components/CBMap.vue';
import CBAvailabilityCalendar from '../components/CBAvailabilityCalendar.vue';

defineProps<{
  config: CommonsSearchConfiguration;
  api: CommonsSearchAPI;
}>();
const { t } = useI18n();

const showMap = ref(false);
const mapHeight = computed(() => (showMap.value ? '600px' : '0px'));
const { filter, resetFilters, filteredCommons, filteredAndSortedCommons, locationMap } =
  useGlobalState();
</script>

<style scoped>
.cb-commons-search {
  grid-template-areas: 'filter' 'map' 'acal';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: min-content min(v-bind(mapHeight), 40dvh) auto;
}

@media (min-width: 800px) {
  .cb-commons-search {
    grid-template-rows: min-content v-bind(mapHeight) auto;
  }
}
</style>

<i18n lang="yaml">
en:
  showMap: 'Show map'
  hideMap: 'Hide map'

de:
  showMap: 'Karte anzeigen'
  hideMap: 'Karte verstecken'
</i18n>
