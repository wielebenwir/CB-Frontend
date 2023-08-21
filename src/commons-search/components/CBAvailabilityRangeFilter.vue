<template>
  <div>
    <header class="tw-flex tw-items-center">
      <CBFilterLabel :label="t('title')" />
      <button
        v-show="start || end || showEnd"
        type="button"
        class="cb-btn tw-p-1 tw-bg-base-1 tw-ml-auto"
        @click="reset"
        :aria-label="t('reset')"
      >
        <IconCross class="tw-w-4 tw-h-4" />
      </button>
    </header>
    <div class="tw-flex tw-flex-wrap tw-items-end tw-justify-start tw-gap-2 tw-max-w-full">
      <label class="tw-flex-1 md:tw-max-w-[200px] md:tw-min-w-0">
        <span class="tw-block tw-mb-1">
          <span class="tw-sr-only">{{ t('title') }}</span>
          {{ t(showEnd ? 'from' : 'on') }}
        </span>
        <input
          v-model="start"
          type="date"
          class="cb-input cb-input-date"
          :min="toDateString(startRange.min)"
          :max="toDateString(startRange.max)"
          @blur="checkInvalid"
        />
      </label>

      <label v-if="showEnd" class="tw-flex-1 md:tw-max-w-[200px] md:tw-min-w-0">
        <span class="tw-block tw-mb-1">
          <span class="tw-sr-only">{{ t('title') }}</span>
          {{ t('until') }}
        </span>
        <input
          v-model="end"
          type="date"
          class="cb-input cb-input-date"
          :min="toDateString(endRange.min)"
          :max="toDateString(endRange.max)"
          @blur="checkInvalid"
        />
      </label>
      <button
        v-else
        type="button"
        class="cb-btn tw-bg-base-1"
        @click="showEnd = true"
        :aria-description="t('addUntilDescription')"
      >
        {{ t('addUntil') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, ref, watch } from 'vue';
import { IconCross } from '../../icons';
import { enforceDateRange, parseDate, toDateString } from '../../util';
import { CommonFilterSet } from '../filter';
import CBFilterLabel from './CBFilterLabel.vue';

const props = defineProps<{
  modelValue: CommonFilterSet['availableBetween'];
  availabilityRange: { start: Date; end: Date };
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: CommonFilterSet['availableBetween']): void;
}>();
const { t } = useI18n();

const showEnd = ref(props.modelValue.end !== null);
const start = ref<string>(props.modelValue.start ? toDateString(props.modelValue.start) : '');
const end = ref<string>(props.modelValue.end ? toDateString(props.modelValue.end) : '');
const startRange = computed(() => ({
  min: props.availabilityRange.start,
  max: props.availabilityRange.end,
}));
const startSafe = computed(() => enforceDateRange(parseDate(start.value), startRange.value));
const endRange = computed(() => ({
  min: startSafe.value ?? props.availabilityRange.start,
  max: props.availabilityRange.end,
}));
const endSafe = computed(() => enforceDateRange(parseDate(end.value), endRange.value));

function reset() {
  start.value = '';
  end.value = '';
  showEnd.value = false;
}

function checkInvalid(event: Event) {
  if (event.target instanceof HTMLInputElement && 'reportValidity' in event.target) {
    event.target.reportValidity();
  }
}

watch(
  computed(() => props.modelValue),
  ({ start, end }) => {
    if (start === null && end === null) {
      // if start and end have been reset
      // we should reset our internal component state as well
      reset();
    }
  },
);

watch([startSafe, endSafe], ([start, end]) => {
  emit('update:modelValue', { start, end });
});
</script>

<i18n lang="yaml">
en:
  title: 'Available'
  on: 'On'
  from: 'From'
  until: 'Through'
  addUntil: '+ End Date'
  addUntilDescription: 'Add last day for multi-day rental.'
  reset: 'Reset availability filter.'

de:
  title: 'Verfügbar'
  on: 'Am'
  from: 'Vom'
  until: 'Bis einschließlich'
  addUntil: '+ Enddatum'
  addUntilDescription: 'Letzten Tag einer mehrtägigen Ausleihe hinzufügen.'
  reset: 'Verfügbarkeitsfilter zurücksetzen.'
</i18n>
