<template>
  <div class="cb-location-filter">
    <template v-if="!currentLocation">
      <div class="tw-grid" style="grid-template-columns: minmax(0, 1fr)">
        <Combobox v-if="!currentLocation" @update:model-value="setLocation">
          <ComboboxInput
            ref="inputEl"
            class="cb-input cb-grid-cover"
            autocomplete="off"
            :aria-label="t('filter.location.label')"
            :placeholder="t('filter.location.placeholder')"
            @change="address = $event.target.value"
          />
          <transition name="cb-animate-panel">
            <ComboboxOptions
              v-if="locations.length > 0"
              class="tw-absolute tw-inset-x-6 tw-z-20 tw-mt-3 tw-bg-white tw-p-6 tw-shadow-lg tw-rounded-lg"
              :style="{ top: `${inputBottom}px` }"
            >
              <ComboboxOption
                v-for="location in locations.slice(0, 5)"
                :key="location.id"
                v-slot="{ active }"
                as="template"
                :value="location"
              >
                <li
                  class="cb-button tw-justify-start tw-gap-3"
                  :class="{ 'tw-bg-gray-100': active }"
                >
                  <CBLocationIcon />
                  <span>{{ location.name }}</span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </transition>
        </Combobox>
        <div class="tw-self-center tw-place-self-end tw-mr-1 cb-grid-cover">
          <button
            v-if="canGetUserPosition && !isLoadingLocations"
            type="button"
            class="cb-button tw-p-1 tw-bg-gray-100"
            :aria-label="t('filter.location.getPosition')"
            @click="locateUser"
          >
            <img class="tw-w-6 tw-h-6" src="../../assets/crosshair.svg" alt="" />
          </button>
          <CBLoader v-else-if="isLoadingLocations" :label="t('filter.location.waitGeoCoder')" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="tw-grid">
        <p
          class="tw-mb-0 tw-min-w-0 cb-grid-cover cb-input tw-bg-white"
          :title="currentLocation.name"
        >
          <span class="tw-truncate tw-w-10/12 tw-block">{{ currentLocation.name }}</span>
        </p>
        <button
          type="button"
          class="cb-button tw-p-1 tw-bg-gray-100 cb-grid-cover tw-self-center tw-place-self-end tw-mr-1"
          :title="t('filter.location.reset')"
          @click="currentLocation = null"
        >
          <img class="tw-w-6 tw-h-6" src="../../assets/cross.svg" alt="" />
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue';
import { computed, ref } from 'vue';
import { GeoLocation, useCurrentLocation, useGeoCoder } from '../geo';
import { ParsedCommonsSearchConfiguration } from '../types';
import CBLoader from '../../components/CBLoader.vue';
import { useI18n } from '../locales';
import CBLocationIcon from './CBLocationIcon.vue';
import { useBottom } from '../../util';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration['geocode'];
  modelValue: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: GeoLocation | null): void;
}>();
const { t } = useI18n();

const address = ref('');
const inputEl = ref();
const inputBottom = useBottom(inputEl);
const { locations, isLoading: isLoadingLocations } = useGeoCoder(address, props.config);
const { isSupported: canGetUserPosition, getCurrentLocation } = useCurrentLocation();
const currentLocation = computed({
  get: () => props.modelValue,
  set: (value: GeoLocation | null) => {
    emit('update:modelValue', value);
  },
});

function setLocation(location: GeoLocation) {
  currentLocation.value = location;
}

async function locateUser() {
  // TODO: do proper error handling
  try {
    currentLocation.value = await getCurrentLocation();
  } catch (err) {
    console.error(err);
  }
}
</script>
