<template>
  <div v-if="expanded" class="cb-common-filter-panel cb-common-filter-panel--expanded">
    <slot />
  </div>

  <template v-else-if="isSmallViewPort">
    <button type="button" class="cb-button tw-bg-gray-200" @click="isDialogOpen = true">
      <img src="../../assets/filter.svg" class="tw-flex-none" />
      {{ t('buttonLabel') }}
    </button>

    <CBDialog v-model:is-open="isDialogOpen">
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

      <footer class="tw-h-4"></footer>
    </CBDialog>
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
import { DialogTitle, Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useMediaQuery } from '@vueuse/core';

import { useBottom } from '../../util';
import CBDialog from './CBDialog.vue';

defineProps<{
  expanded?: boolean;
}>();

const { t } = useI18n();

const isSmallViewPort = useMediaQuery('(max-width: 448px)');
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
