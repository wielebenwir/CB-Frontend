<template>
  <div v-if="expanded" class="cb-common-filter-panel cb-common-filter-panel--expanded">
    <slot />
  </div>

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
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

import { useBottom } from '../../util';

const props = defineProps<{
  expanded?: boolean;
}>();

const { t } = useI18n();

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

de:
  buttonLabel: Filtern
</i18n>
