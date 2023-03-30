<template>
  <div
    class="cb-availabilities cb-availabilities-seven-days tw-flex tw-transition tw-rounded tw-overflow-hidden"
  >
    <CBAvailability
      v-for="availability in sevenDaysAvailability"
      :key="availability.date.toISOString()"
      class="tw-flex-1"
      :availability="availability"
    />
  </div>
</template>

<script lang="ts" setup>
import { addDays, compareAsc } from 'date-fns';
import { computed } from 'vue';
import { useNow } from '@vueuse/core';
import { CommonAvailability } from '../types';
import { isDateInDayRange } from '../../util';
import CBAvailability from './CBAvailability.vue';

const props = defineProps<{
  availabilities: CommonAvailability[];
}>();

const now = useNow({ interval: 60 * 1000 });
const sevenDaysFromNow = computed(() => addDays(now.value, 7));
const sevenDaysAvailability = computed(() =>
  props.availabilities
    .filter((a) => isDateInDayRange(now.value, sevenDaysFromNow.value, a.date))
    .sort((a, b) => compareAsc(a.date, b.date)),
);
</script>
