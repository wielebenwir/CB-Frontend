<template>
  <div v-if="!api && !apiError">
    <p>Loading location data...</p>
  </div>

  <div v-else-if="apiError">
    <p>{{ apiError }}</p>
    <p></p>
    <p>
      <button type="button" @click="retryAPI">Retry</button>
    </p>
  </div>

  <div v-else-if="api" class="cb-commons-search">
    <CBSidebar
      class="tw-isolate tw-z-10 tw-flex tw-flex-col md:tw-rounded-l"
      style="grid-area: sidebar"
    >
      <CBCommonFilter v-model="filter" class="tw-flex-none" :api="api" :config="config" />
      <CBCommonList
        class="tw-isolate tw-z-10"
        :categories="api.categories"
        :commons="filteredCommons"
        :locations="filteredLocations"
        :selected-location="filter.location"
        :user-location="filter.userLocation"
        @deselect-location="filter.location = null"
      />
    </CBSidebar>
    <CBMap
      class="tw-isolate tw-z-0 md:tw-rounded-r"
      style="grid-area: map"
      :locations="filteredLocations"
      :user-location="filter.userLocation"
      :config="config"
      @select="filter.location = $event"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import { ParsedCommonsSearchConfiguration } from '../types';
import { useCommonsSearchAPI } from '../apis';
import { useI18n } from '../locales';
import CBCommonFilter from './CBCommonFilter.vue';
import CBCommonList from './CBCommonList.vue';
import CBMap from './CBMap.vue';
import { CommonFilterSet, useFilteredData } from '../filter';
import CBSidebar from './CBSidebar.vue';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration;
}>();

// API data
const filter = ref<CommonFilterSet>({
  categories: new Set<number>(),
  userLocation: null,
  location: null,
});
const { api, apiError, retryAPI } = useCommonsSearchAPI(props.config);
const { filteredLocations, filteredCommons } = useFilteredData(api, filter);

// i18n config
const { locale } = useI18n();
watchEffect(() => {
  locale.value = props.config.locale;
});
</script>

<style scoped>
.cb-commons-search {
  box-sizing: border-box;
  padding: 2rem;
  display: grid;
  grid-template-areas: 'sidebar' 'map';
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
  height: 100%;
}

@media (min-width: 800px) {
  .cb-commons-search {
    grid-template-areas: 'sidebar map';
    grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    gap: 0;
  }
}
</style>
