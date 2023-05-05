<template>
  <span
    class="cb-availability tw-relative tw-text-sm tw-p-1 tw-text-center tw-select-none tw-leading-none tw-min-h-[1rem]"
    :title="t(availability.status)"
    :class="`cb-availability--${availability.status}`"
  >
    <slot v-if="!noLabel">
      <span class="tw-block tw-font-bold">{{ weekdayName }}</span>
      <span>{{ availability.date.getDate() }}.</span>
    </slot>
  </span>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed } from 'vue';
import { CommonAvailability } from '../types';

const props = defineProps<{
  availability: CommonAvailability;
  noLabel?: boolean;
}>();

const { locale, t } = useI18n();
const formatter = computed<Intl.DateTimeFormat>(
  () => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }),
);
const weekdayName = computed(() => formatter.value.format(props.availability.date));
</script>

<i18n lang="yaml">
en:
  available: 'Available on this day.'
  booked: 'Already booked on this day.'
  partially-booked: 'Partially booked on this day.'
  locked: 'Cannot be borrowed on this day (i.e. for maintenance or other reasons).'
  closed: 'The lending station is closed on this day.'

de:
  available: 'An diesem Tag verfügbar.'
  booked: 'An diesem Tag bereits gebucht.'
  partially-booked: 'An diesem Tag bereits teilweise gebucht.'
  locked: 'An diesem Tag nicht ausleihbar (z.B. wegen Wartung oder anderen Gründen).'
  closed: 'Die Ausleihstation ist an diesem Tag geschlossen.'
</i18n>

<style lang="postcss">
.cb-availability {
  --cb-availability-available-color: theme('colors.base-1');
  --cb-availability-available-text-color: currentColor;
  --cb-availability-booked-color: var(--commonsbooking-color-error, #d5425c);
  --cb-availability-booked-text-color: white;
  --cb-availability-locked-color: var(--cb-availability-booked-color);
  --cb-availability-locked-text-color: var(--cb-availability-booked-text-color);
  --cb-availability-closed-color: theme('colors.gray.600');
  --cb-availability-closed-text-color: white;
}

.cb-availability--available {
  background-color: var(--cb-availability-available-color);
  color: var(--cb-availability-available-text-color);
}

.cb-availability--partially-booked {
  background-image: linear-gradient(
    -45deg,
    var(--cb-availability-available-color),
    var(--cb-availability-available-color) 50%,
    var(--cb-availability-booked-color) 50%,
    var(--cb-availability-booked-color)
  );
  color: var(--cb-availability-available-text-color);
}

.cb-availability--booked {
  background-color: var(--cb-availability-booked-color);
  color: var(--cb-availability-booked-text-color);
}

.cb-availability--locked {
  background-color: var(--cb-availability-locked-color);
  color: var(--cb-availability-locked-text-color);
}

.cb-availability--closed {
  background-color: var(--cb-availability-closed-color);
  color: var(--cb-availability-closed-text-color);
}
</style>
