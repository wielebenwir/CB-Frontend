<template>
  <div v-if="expanded" class="cb-common-filter-panel cb-common-filter-panel--expanded">
    <slot />
  </div>

  <template v-else-if="isSmallViewPort">
    <button type="button" class="cb-btn tw-bg-base-2" @click="isDialogOpen = true">
      <IconFilter class="tw-flex-none" />
      {{ t('buttonLabel') }}
    </button>

    <CBDialog v-model:is-open="isDialogOpen" :title="t('dialogTitle', { commons: t('common', 0) })">
      <div class="tw-flex-1 tw-min-h-0 tw-px-4 tw-overflow-y-auto tw-max-w-full tw-mb-4">
        <div class="cb-common-filter-panel cb-common-filter-panel--dialog">
          <slot />
        </div>
      </div>
    </CBDialog>
  </template>

  <Popover v-else class="tw-flex-none">
    <PopoverButton ref="filterButtonEl" class="cb-btn tw-bg-base-2">
      <IconFilter class="tw-flex-none" />
      {{ t('buttonLabel') }}
    </PopoverButton>

    <transition name="cb-animate-panel">
      <PopoverPanel
        class="tw-absolute tw-mt-3 tw-z-20 tw-bg-base-0 tw-shadow-2xl tw-rounded-lg tw-max-w-sm tw-ml-auto tw-overflow-hidden"
        :style="{ top: `${filterButtonBottom}px`, insetInline: '1.5rem' }"
      >
        <template #default="{ close }">
          <header
            class="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-base-2 tw-px-4 tw-py-4 tw-bg-inherit tw-flex-none tw-z-20"
          >
            <p class="tw-text-lg tw-font-bold tw-m-0">
              {{ t('dialogTitle', { commons: t('common', 0) }) }}
            </p>

            <button
              type="button"
              class="cb-btn tw-bg-base-1 tw-p-1"
              :aria-label="t('closeDialog')"
              @click="close"
            >
              <IconCross />
            </button>
          </header>

          <div class="tw-p-4 cb-common-filter-panel">
            <slot />
          </div>
        </template>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useMediaQuery } from '@vueuse/core';

import { IconCross, IconFilter } from '../../icons';
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
.cb-common-filter-panel--expanded .cb-btn:not(.cb-category--active) {
  @apply tw-bg-base-2;
}

.cb-common-filter-panel {
  @apply tw-flex tw-flex-col tw-gap-6;
}
</style>

<i18n lang="yaml">
en:
  buttonLabel: Filter
  dialogTitle: 'Filter {commons}'
  closeDialog: Close filter dialog

de:
  buttonLabel: Filtern
  dialogTitle: '{commons} filtern'
  closeDialog: Filterdialog schließen
</i18n>
