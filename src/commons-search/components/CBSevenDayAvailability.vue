<template>
  <div
    class="cb-availabilities cb-availabilities-seven-days tw-flex tw-transition tw-rounded tw-overflow-hidden"
  >
    <CBAvailability
      v-for="{ status, date } in sevenDaysAvailability"
      :key="date.isoDate"
      class="tw-flex-1"
      :availability-status="status"
      :date="date"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommonAvailability } from '../types';
import { useNextDays } from '../../util';
import CBAvailability from './CBAvailability.vue';

const props = defineProps<{
  availabilities: Record<string, CommonAvailability>;
}>();

const nextSevenDays = useNextDays(7);
const sevenDaysAvailability = computed(() => {
  return nextSevenDays.value.map((preformattedDate) => {
    return {
      status: props.availabilities[preformattedDate.isoDate]?.status ?? 'unknown',
      date: preformattedDate,
    };
  });
});
</script>
