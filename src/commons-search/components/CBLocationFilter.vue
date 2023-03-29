<template>
  <div class="cb-location-filter">
    <CBFilterLabel :label="t('filter.location.label')" />

    <template v-if="!currentLocation">
      <div class="tw-grid tw-relative">
        <Combobox v-if="!currentLocation" @update:model-value="setLocation">
          <ComboboxInput
            class="cb-input"
            style="grid-area: 1 / 1"
            @change="address = $event.target.value"
          />
          <ComboboxOptions
            v-if="locations.length > 0"
            class="tw-absolute tw-top-full tw-z-20 tw-mt-1 tw-bg-white tw-p-6 tw-shadow-lg tw-rounded-lg tw-max-w-md"
          >
            <ComboboxOption
              v-for="location in locations.slice(0, 5)"
              :key="location.id"
              v-slot="{ active }"
              as="template"
              :value="location"
            >
              <li class="cb-button tw-justify-start tw-gap-3" :class="{ 'tw-bg-gray-100': active }">
                <div
                  class="tw-w-12 tw-h-12 tw-flex-none tw-cb-flex-center tw-bg-gray-200 tw-rounded-lg"
                >
                  <img class="tw-h-8" src="../../assets/map-marker.svg" alt="" />
                </div>
                <span>{{ location.name }}</span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <div class="tw-self-center tw-place-self-end tw-mr-2" style="grid-area: 1 / 1">
          <button
            v-if="canGetUserPosition && !isLoadingLocations"
            type="button"
            class="tw-cb-flex-center tw-w-9 tw-h-9"
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
      <div class="lg:tw-flex tw-items-center tw-gap-3">
        <p class="tw-mb-2 lg:tw-mb-0">{{ currentLocation.name }}</p>
        <button class="cb-button tw-bg-gray-200" @click="currentLocation = null">
          <img src="../../assets/cross.svg" alt="" />
          <span>{{ t('filter.location.reset') }}</span>
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
import CBFilterLabel from './CBFilterLabel.vue';
import { useI18n } from '../locales';

const props = defineProps<{
  config: ParsedCommonsSearchConfiguration['geocode'];
  modelValue: GeoLocation | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: GeoLocation | null): void;
}>();
const { t } = useI18n();

const address = ref('');
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
