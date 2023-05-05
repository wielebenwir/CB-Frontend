<template>
  <TransitionRoot appear :show="isDialogOpen" as="template">
    <Dialog as="div" class="tw-relative tw-z-50 cb-app" @close="isDialogOpen = false">
      <TransitionChild
        as="template"
        enter="tw-duration-300 tw-ease-out"
        enter-from="tw-opacity-0"
        enter-to="tw-opacity-100"
        leave="tw-duration-200 tw-ease-in"
        leave-from="tw-opacity-100"
        leave-to="tw-opacity-0"
      >
        <div class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-25 tw-backdrop-blur-sm" />
      </TransitionChild>

      <div class="tw-fixed tw-inset-0 tw-max-h-full">
        <div class="tw-h-full tw-p-4 tw-flex tw-flex-col tw-items-center tw-justify-center">
          <TransitionChild
            as="template"
            enter="tw-duration-300 tw-ease-out"
            enter-from="tw-opacity-0 tw-scale-95"
            enter-to="tw-opacity-100 tw-scale-100"
            leave="tw-duration-200 tw-ease-in"
            leave-from="tw-opacity-100 tw-scale-100"
            leave-to="tw-opacity-0 tw-scale-95"
          >
            <DialogPanel
              class="tw-w-full tw-transform tw-rounded tw-bg-base-0 tw-shadow-xl tw-transition-all tw-max-h-full tw-flex tw-flex-col tw-overflow-hidden"
              v-bind="attrs"
            >
              <slot name="header">
                <header
                  class="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-base-2 tw-p-4 tw-mb-4 tw-bg-inherit tw-flex-none tw-z-20"
                >
                  <DialogTitle as="h3" class="tw-text-lg tw-font-bold tw-m-0">
                    {{ title }}
                  </DialogTitle>

                  <button
                    type="button"
                    class="cb-btn tw-bg-base-1 tw-p-1"
                    @click="emit('update:isOpen', false)"
                  >
                    <IconCross />
                  </button>
                </header>
              </slot>

              <slot />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts" setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useVModel } from '@vueuse/core';
import { useAttrs } from 'vue';
import { IconCross } from '../../icons';

const props = defineProps<{
  isOpen: boolean;
  title?: string;
}>();
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
}>();

const attrs = useAttrs();
const isDialogOpen = useVModel(props, 'isOpen', emit);
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
