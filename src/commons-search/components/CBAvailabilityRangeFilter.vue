<template>
  <div>
    <header class="tw-flex tw-items-center">
      <CBFilterLabel :label="t('title')" />
      <button
        v-show="start || end || showEnd"
        type="button"
        class="cb-btn tw-p-1 tw-bg-gray-100 tw-ml-auto"
        @click="reset"
      >
        <IconCross class="tw-w-4 tw-h-4" />
      </button>
    </header>
    <div class="tw-flex tw-flex-wrap tw-items-end tw-justify-start tw-gap-2 tw-max-w-full">
      <label class="tw-flex-1 md:tw-min-w-0">
        <span class="tw-block tw-mb-1">{{ t(showEnd ? 'from' : 'on') }}</span>
        <input
          v-model="start"
          type="date"
          class="cb-input cb-input-date"
          :min="toDateString(availabilityRange.start)"
          :max="toDateString(availabilityRange.end)"
        />
      </label>

      <label v-if="showEnd" class="tw-flex-1 md:tw-min-w-0">
        <span class="tw-block tw-mb-1">{{ t('until') }}</span>
        <input
          v-model="end"
          type="date"
          class="cb-input cb-input-date"
          :min="start ? start : toDateString(availabilityRange.start)"
          :max="toDateString(availabilityRange.end)"
        />
      </label>
      <button v-else type="button" class="cb-btn tw-bg-gray-100" @click="showEnd = true">
        {{ t('addUntil') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { parseISO } from 'date-fns';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { computed, ref, watch } from 'vue';
import { IconCross } from '../../icons';
import { toDateString } from '../../util';
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

function reset() {
  start.value = '';
  end.value = '';
  showEnd.value = false;
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

watch([start, end], () => {
  emit('update:modelValue', {
    start: start.value ? parseISO(start.value) : null,
    end: end.value ? parseISO(end.value) : null,
  });
});
</script>

<i18n lang="yaml">
en:
  title: 'Available'
  on: 'On'
  from: 'From'
  until: 'Through'
  addUntil: '+ End Date'

de:
  title: 'Verfügbar'
  on: 'Am'
  from: 'Vom'
  until: 'Bis einschließlich'
  addUntil: '+ Enddatum'
</i18n>
