<template>
  <tr>
    <th class="cb-acal-name tw-font-semibold !tw-border-r" scope="row">
      <span class="tw-line-clamp-2">
        <a v-bind="anchorAttrs">{{ common.name }}</a>
      </span>
    </th>
    <td class="cb-acal-location">
      <span class="tw-line-clamp-2">{{ location?.name }}</span>
    </td>
    <td
      v-for="(date, index) in calendarDates"
      :key="date.getTime()"
      :class="[
        'cb-acal-day',
        `cb-acal-day--${days[date.getDay()]}`,
        { '!tw-border-l': index === 0 },
      ]"
    >
      <template v-if="common.availabilities[index]">
        <CBAvailability
          v-if="common.availabilities[index]"
          class="tw-w-full tw-block tw-h-3"
          :availability="common.availabilities[index]"
          no-label
        />
      </template>
      <span v-else>-</span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { days, useAnchorAttributes } from '../../util';
import { useGlobalState } from '../state';
import { Common } from '../types';
import CBAvailability from './CBAvailability.vue';

const props = defineProps<{
  common: Common;
  calendarDates: Date[];
}>();

const { locationMap } = useGlobalState();
const location = computed(() => locationMap.value.get(props.common.locationId));
const anchorAttrs = useAnchorAttributes(computed(() => props.common.url));
</script>
