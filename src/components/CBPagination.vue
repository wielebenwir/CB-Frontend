<template>
  <nav class="cb-pagination tw-mt-3 tw-flex tw-items-center">
    <p class="cb-pagination-info tw-m-0 tw-mr-4 tw-tabular-nums">
      {{ t('page', { page: modelValue, pageCount }) }}
    </p>

    <div class="cb-pagination-pages tw-flex" role="menubar">
      <button
        v-for="page in pageCount"
        :key="page"
        type="button"
        class="cb-btn cb-pagination-page tw-rounded-none first:tw-rounded-l last:tw-rounded-r"
        :class="{
          'tw-bg-active': page === modelValue,
          'tw-bg-base-1': page !== modelValue,
        }"
        :aria-current="modelValue === page ? 'true' : undefined"
        :aria-setsize="pageCount"
        :aria-posinset="page"
        :aria-checked="modelValue === page"
        :aria-label="modelValue === page ? t('currentPage', { page }) : t('gotoPage', { page })"
        role="menuitemradio"
        @click="setPage(page)"
      >
        {{ page }}
      </button>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';

const props = defineProps<{
  modelValue: number;
  pageCount: number;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();
const { t } = useI18n();

function setPage(page: number) {
  if (page !== props.modelValue) {
    emit('update:modelValue', page);
  }
}
</script>

<i18n lang="yaml">
de:
  page: 'Seite {page} von {pageCount}'
  gotoPage: 'Gehe zu Seite {page}'
  currentPage: 'Aktuelle Seite, Seite {page}'

en:
  page: 'Page {page} of {pageCount}'
  gotoPage: 'Go to page {page}'
  currentPage: 'Current page, Page {page}'
</i18n>
