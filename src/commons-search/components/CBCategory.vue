<template>
  <label
    class="cb-category cb-btn tw-truncate"
    :class="{ 'cb-category--active tw-bg-active': modelValue, 'tw-bg-base-1': !modelValue }"
    @keydown.space.prevent
    @keyup.space="value = !value"
    @keyup.enter="value = !value"
  >
    <input
      :value="category.id"
      :checked="value"
      :type="type ?? 'checkbox'"
      :name="name"
      class="tw-sr-only"
      @change="value = !value"
      @click="maybeDeselect"
    />
    <span>{{ category.name }}</span>
  </label>
</template>

<script lang="ts" setup>
import { CommonCategory } from '../types';
import { computed } from 'vue';

const props = defineProps<{
  category: CommonCategory;
  modelValue: boolean;
  type?: 'radio' | 'checkbox';
  name?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (state: boolean) => {
    emit('update:modelValue', state);
  },
});

function maybeDeselect() {
  // Radio inputs cannot be de-selected by default,
  // so we need a little help with that.
  if (props.modelValue && props.type === 'radio') {
    value.value = false;
  }
}
</script>
