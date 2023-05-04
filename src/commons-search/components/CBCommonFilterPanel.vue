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
        class="cb-common-filter-panel tw-absolute tw-mt-3 tw-inset-x-6 tw-z-20 tw-bg-base-0 tw-p-6 tw-shadow-lg tw-rounded-lg"
        :style="{ top: `${filterButtonBottom}px` }"
      >
        <slot />
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useMediaQuery } from '@vueuse/core';

import { IconFilter } from '../../icons';
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
.cb-common-filter-panel--expanded .cb-btn {
  @apply tw-bg-base-2;
}

.cb-common-filter-panel {
  @apply tw-flex tw-flex-col tw-gap-4;
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
