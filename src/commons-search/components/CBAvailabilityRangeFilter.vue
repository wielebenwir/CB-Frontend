<template>
  <div>
    <header class="tw-flex tw-items-center tw-justify-between">
      <CBFilterLabel :label="t('title')" />
      <button
        v-show="start || end || showEnd"
        type="button"
        class="cb-button tw-p-1 tw-bg-gray-100"
        @click="reset"
      >
        <img class="tw-w-4 tw-h-4" src="../../assets/cross.svg" alt="" />
      </button>
    </header>
    <div class="tw-flex tw-items-end tw-gap-x-2">
      <label class="tw-flex-1 tw-min-w-0">
        <span class="tw-block tw-mb-1">{{ t(showEnd ? 'from' : 'on') }}</span>
        <input
          v-model="start"
          type="date"
          class="cb-input tw-border"
          :min="toDateString(availabilityRange.start)"
          :max="toDateString(availabilityRange.end)"
        />
      </label>

      <label v-if="showEnd" class="tw-flex-1 tw-min-w-0">
        <span class="tw-block tw-mb-1">{{ t('until') }}</span>
        <input
          v-model="end"
          type="date"
          class="cb-input tw-border"
          :min="start ? start : toDateString(availabilityRange.start)"
          :max="toDateString(availabilityRange.end)"
        />
      </label>
      <button v-else type="button" class="cb-button tw-bg-gray-100" @click="showEnd = true">
        {{ t('addUntil') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { parseISO } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
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
