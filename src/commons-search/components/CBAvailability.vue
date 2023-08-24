<template>
  <span
    class="cb-availability tw-relative tw-text-sm tw-p-1 tw-text-center tw-select-none tw-leading-none tw-min-h-[1rem]"
    :title="t(availabilityStatus, { date: date.localeDate })"
    :class="`cb-availability--${availabilityStatus}`"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span class="tw-sr-only" v-html="t(availabilityStatus, { date: localeDateHTML })" />
    <slot v-if="!noLabel">
      <span role="presentation">
        <span class="tw-block tw-font-bold">{{ date.weekdayName }}</span>
        <span>{{ date.date.getDate() }}</span>
      </span>
    </slot>
    <slot v-if="showIcon" name="icon">
      <component
        :is="availabilityStatusIconMap[availabilityStatus]"
        v-if="availabilityStatus in availabilityStatusIconMap"
        class="tw-absolute tw-inset-0 tw-m-auto tw-h-3"
      />
    </slot>
  </span>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, FunctionalComponent } from 'vue';
import { CommonAvailabilityStatus, PreformattedDate } from '../types';
import { IconHeart, IconMoon } from '../../icons';

const availabilityStatusIconMap: { [s in CommonAvailabilityStatus]?: FunctionalComponent } = {
  'location-closed': IconMoon,
  locked: IconHeart,
};

const props = defineProps<{
  date: PreformattedDate;
  availabilityStatus: CommonAvailabilityStatus;
  noLabel?: boolean;
  showIcon?: boolean;
}>();

const { t } = useI18n();
const localeDateHTML = computed(
  () => `<time datetime="${props.date.isoDate}">${props.date.localeDate}</time>`,
);
</script>

<i18n lang="yaml">
en:
  available: 'Available on {date}.'
  booked: 'Already booked on {date}.'
  partially-booked: 'Partially booked on {date}.'
  locked: 'Cannot be borrowed on {date} (i.e. for maintenance or other reasons).'
  unknown: 'Availability on {date} is yet to be determined.'
  location-closed: 'The lending station is closed on {date}.'
  location-holiday: 'The lending station is closed on {date}.'

de:
  available: 'Am {date} verfügbar.'
  booked: 'Am {date} bereits gebucht.'
  partially-booked: 'Am {date} bereits teilweise gebucht.'
  locked: 'Am {date} nicht ausleihbar (z.B. wegen Wartung oder anderen Gründen).'
  unknown: 'Die Verfügbarkeit am {date} ist noch unklar.'
  location-closed: 'Am {date} ist die Ausleihstation geschlossen.'
  location-holiday: 'Am {date} ist die Ausleihstation geschlossen.'
</i18n>

<style lang="postcss">
.cb-availability {
  --cb-availability-available-color: var(--commonsbooking-color-success, theme('colors.green.500'));
  --cb-availability-available-text-color: currentColor;
  --cb-availability-booked-color: theme('colors.gray.100');
  --cb-availability-booked-text-color: theme('colors.gray.600');
  --cb-availability-locked-color: var(--cb-availability-booked-color);
  --cb-availability-locked-text-color: var(--cb-availability-booked-text-color);
  --cb-availability-unknown-color: var(--cb-availability-booked-color);
  --cb-availability-unknown-text-color: var(--cb-availability-booked-text-color);
  --cb-availability-location-closed-color: var(--cb-availability-booked-color);
  --cb-availability-location-closed-text-color: var(--cb-availability-booked-text-color);
  --cb-availability-location-holiday-color: var(--cb-availability-booked-color);
  --cb-availability-location-holiday-text-color: var(--cb-availability-booked-text-color);
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

.cb-availability--unknown {
  background-color: var(--cb-availability-unknown-color);
  color: var(--cb-availability-unknown-text-color);
}

.cb-availability--location-closed {
  background-color: var(--cb-availability-location-closed-color);
  color: var(--cb-availability-location-closed-text-color);
}

.cb-availability--location-holiday {
  background-color: var(--cb-availability-location-holiday-color);
  color: var(--cb-availability-location-holiday-text-color);
}
</style>
