<template>
  <span
    class="cb-availability tw-text-sm tw-font-bold tw-p-1 tw-text-center tw-select-none tw-leading-none"
    :title="t(`availability.${availability.status}`)"
    :class="[
      `cb-availability-${availability.status}`,
      {
        'tw-bg-gray-100': availability.status === 'available',
        'tw-bg-amber-500 tw-text-white cb-pattern-lines':
          availability.status === 'partially-booked',
        'tw-bg-rose-500 tw-text-white cb-pattern-cross': availability.status === 'booked',
        'tw-bg-gray-500 tw-text-white cb-pattern-cross': availability.status === 'locked',
      },
    ]"
    >{{ weekdayName }}</span
  >
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CommonAvailability } from '../types';
import { useI18n } from '../locales';

const props = defineProps<{
  availability: CommonAvailability;
}>();

const { locale, t } = useI18n();
const formatter = computed<Intl.DateTimeFormat>(
  () => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }),
);
const weekdayName = computed(() => formatter.value.format(props.availability.date));
</script>
