<template>
  <SwitchGroup>
    <div class="tw-flex tw-items-center tw-gap-2">
      <Switch
        v-model="enabled"
        :class="enabled ? 'tw-bg-teal-300' : 'tw-bg-gray-200'"
        class="tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-items-center tw-rounded-full tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2"
      >
        <span
          :class="enabled ? 'tw-translate-x-6' : 'tw-translate-x-1'"
          class="tw-inline-block tw-h-4 tw-w-4 tw-transform tw-rounded-full tw-bg-white tw-transition-transform"
        />
      </Switch>
      <SwitchLabel v-if="label">{{ label }}</SwitchLabel>
    </div>
  </SwitchGroup>
</template>
<script lang="ts" setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  modelValue: boolean;
  label: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
const enabled = useVModel(props, 'modelValue', emit);
</script>
