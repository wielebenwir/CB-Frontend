<template>
  <div v-if="expanded" class="cb-common-filter-panel cb-common-filter-panel--expanded">
    <slot />
  </div>

  <template v-else-if="isSmallViewPort">
    <button type="button" class="cb-button tw-bg-gray-200" @click="isDialogOpen = true">
      <img src="../../assets/filter.svg" class="tw-flex-none" />
      {{ t('buttonLabel') }}
    </button>

    <TransitionRoot appear :show="isDialogOpen" as="template">
      <Dialog as="div" class="tw-relative tw-z-50" @close="isDialogOpen = false">
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
          <div class="tw-h-full tw-p-4 tw-flex tw-flex-col tw-justify-center">
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
                class="tw-w-full tw-transform tw-rounded tw-bg-white tw-pb-4 tw-shadow-xl tw-transition-all tw-max-h-full tw-flex tw-flex-col tw-overflow-hidden"
              >
                <header
                  class="tw-flex tw-items-center tw-justify-between tw-border-b tw-p-4 tw-mb-4 tw-bg-inherit tw-flex-none tw-z-20"
                >
                  <DialogTitle as="h3" class="tw-text-lg tw-font-bold">
                    {{ t('dialogTitle') }}
                  </DialogTitle>

                  <button
                    type="button"
                    class="cb-button tw-bg-gray-100 tw-p-1"
                    :aria-label="t('closeDialog')"
                    @click="isDialogOpen = false"
                  >
                    <img src="../../assets/cross.svg" alt="" />
                  </button>
                </header>
                <div class="tw-flex-1 tw-min-h-0 tw-px-4 tw-overflow-y-auto tw-max-w-full">
                  <div class="cb-common-filter-panel cb-common-filter-panel--dialog">
                    <slot />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </template>

  <Popover v-else class="tw-flex-none">
    <PopoverButton ref="filterButtonEl" class="cb-button tw-bg-gray-200">
      <img src="../../assets/filter.svg" class="tw-flex-none" />
      {{ t('buttonLabel') }}
    </PopoverButton>

    <transition name="cb-animate-panel">
      <PopoverPanel
        class="cb-common-filter-panel tw-absolute tw-mt-3 tw-inset-x-6 tw-z-20 tw-bg-white tw-p-6 tw-shadow-lg tw-rounded-lg"
        :style="{ top: `${filterButtonBottom}px` }"
      >
        <slot />
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Popover,
  PopoverButton,
  PopoverPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { useMediaQuery } from '@vueuse/core';

import { useBottom } from '../../util';

defineProps<{
  expanded?: boolean;
}>();

const { t } = useI18n();

const isSmallViewPort = useMediaQuery('(max-height: 1000px)');
const isDialogOpen = ref(false);
const filterButtonEl = ref();
const filterButtonBottom = useBottom(filterButtonEl);
</script>

<style lang="postcss">
.cb-common-filter-panel--expanded .cb-button {
  @apply tw-bg-gray-200;
}

.cb-common-filter-panel {
  @apply tw-flex tw-flex-col tw-gap-4;
}
</style>

<i18n lang="yaml">
en:
  buttonLabel: Filter
  dialogTitle: Filter commons
  closeDialog: Close filter dialog

de:
  buttonLabel: Filtern
  dialogTitle: Commons filtern
  closeDialog: Filterdialog schließen
</i18n>
