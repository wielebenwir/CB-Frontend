<template>
  <div class="cb-location-filter">
    <CBFilterLabel :label="t('filter.location.label')" />

    <template v-if="!currentLocation">
      <div class="grid relative">
        <Combobox v-if="!currentLocation" @update:model-value="setLocation">
          <ComboboxInput
            class="cb-input"
            style="grid-area: 1 / 1"
            @change="address = $event.target.value"
          />
          <ComboboxOptions
            v-if="locations.length > 0"
            class="absolute top-full z-20 mt-1 bg-white p-6 shadow-lg rounded-lg max-w-md"
          >
            <ComboboxOption
              v-for="location in locations.slice(0, 5)"
              :key="location.id"
              v-slot="{ active }"
              as="template"
              :value="location"
            >
              <li class="cb-button justify-start gap-3" :class="{ 'bg-gray-100': active }">
                <div class="w-12 h-12 flex-none tw-c-flex-center bg-gray-200 rounded-lg">
                  <img class="h-8" src="../../assets/map-marker.svg" alt="" />
                </div>
                <span>{{ location.name }}</span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <div class="self-center place-self-end mr-2" style="grid-area: 1 / 1">
          <button
            v-if="canGetUserPosition && !isLoadingLocations"
            type="button"
            class="tw-c-flex-center w-9 h-9"
            :aria-label="t('filter.location.getPosition')"
            @click="locateUser"
          >
            <img class="w-6 h-6" src="../../assets/crosshair.svg" alt="" />
          </button>
          <CBLoader v-else-if="isLoadingLocations" :label="t('filter.location.waitGeoCoder')" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="lg:flex items-center gap-3">
        <p class="mb-2 lg:mb-0">{{ currentLocation.name }}</p>
        <button class="cb-button bg-gray-200" @click="currentLocation = null">
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
