<template>
  <div class="cb-acal tw-overflow-auto tw-max-h-full tw-relative">
    <table class="cb-acal-table tw-table-fixed tw-border-spacing-0 tw-rounded tw-border-separate">
      <colgroup>
        <col class="cb-acal-name" />
        <col class="cb-acal-location" />
        <col
          v-for="{ date, isoDate } in preformattedDates"
          :key="isoDate"
          :class="['cb-acal-day', `cb-acal-day--${days[date.getDay()]}`]"
        />
      </colgroup>
      <thead ref="tableHeadEl">
        <tr>
          <td class="cb-acal-name tw-z-10 !tw-border-r" role="presentation"></td>
          <td class="cb-acal-location" role="presentation"></td>
          <template v-for="month in calendarMonths" :key="month.ref.getTime()">
            <th :colspan="month.numDays" class="tw-text-gray-500 tw-font-normal" scope="colgroup">
              <span class="tw-relative tw-block">
                <span
                  class="tw-sticky tw-right-0"
                  style="
                    left: calc(
                      var(--cb-acal-column-name-width) + var(--cb-acal-column-padding-x) - 1px
                    );
                  "
                >
                  <span class="cb-acal-month-border" />
                  {{ month.ref.toLocaleDateString(locale, { month: 'long' }) }}
                </span>
              </span>
            </th>
          </template>
        </tr>
        <tr>
          <th
            class="cb-acal-name tw-z-10 tw-text-gray-500 tw-font-normal !tw-border-r !tw-border-b"
            scope="col"
          >
            <span>{{ t('name') }}</span>
          </th>
          <th class="cb-acal-location tw-text-gray-500 tw-font-normal !tw-border-b" scope="col">
            <span>{{ t('location') }}</span>
          </th>
          <th
            v-for="({ date, isoDate }, index) in preformattedDates"
            :key="isoDate"
            class="tw-text-sm tw-relative tw-font-semibold !tw-border-b"
            :class="['cb-acal-day', `cb-acal-day--${days[date.getDay()]}`]"
            scope="col"
          >
            <span
              v-show="activeColIndex === index + 2"
              class="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-top-[2px] tw-border-[6px] tw-border-t-[var(--cb-acal-highlight-indicator-color)] tw-aspect-square tw-inline-flex"
            />
            <span>
              {{ date.toLocaleDateString(locale, { day: '2-digit' }) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody @mouseover="moveColumnHighlight" @mouseleave="activeColIndex = 0">
        <template v-for="common in pageItems" :key="common.id">
          <CBAvailabilityCalendarRow :common="common" :calendar-dates="preformattedDates" />
        </template>
      </tbody>
    </table>
  </div>

  <CBPagination
    v-if="commons.length > paginateThreshold"
    v-model="currentPage"
    :aria-label="t('pagination')"
    :page-count="pageCount"
  />
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useElementSize, useOffsetPagination } from '@vueuse/core';
import { computed, ref, watch, watchEffect } from 'vue';
import { createDateFormats, days, getDateMonths, iterDates, toDateString } from '../../util';
import { Common, CommonLocation, IdMap } from '../types';
import CBPagination from '../../components/CBPagination.vue';
import CBAvailabilityCalendarRow from './CBAvailabilityCalendarRow.vue';
import { parseISO } from 'date-fns';

const pageSize = 15;
const paginateThreshold = pageSize * 2;

const props = defineProps<{
  commons: Common[];
  locationMap: IdMap<CommonLocation>;
}>();
const { locale, t } = useI18n();

const tableHeadEl = ref<HTMLTableSectionElement | undefined>();
const { height: tableHeadHeight } = useElementSize(tableHeadEl);
const tableHeadHeightPx = computed(() => `${tableHeadHeight.value}px`);
const { currentPage, pageCount } = useOffsetPagination({
  total: () => props.commons.length,
  pageSize,
});
const pageItems = computed(() => {
  // only paginate if we’ve passed the pagination threshold
  if (props.commons.length < paginateThreshold) return props.commons;
  const start = (currentPage.value - 1) * pageSize;
  return props.commons.slice(start, start + pageSize);
});
const activeColIndex = ref<number>(0);
const latestAvailability = ref(toDateString(new Date()));
const calendarDates = computed(() => Array.from(iterDates(parseISO(latestAvailability.value))));
const preformattedDates = computed(() =>
  calendarDates.value.map((d) => createDateFormats(d, locale.value)),
);
const calendarMonths = computed(() => Array.from(getDateMonths(calendarDates.value)));

watch(
  () => props.commons,
  () => {
    // Reset page if the commons have been changed
    if (currentPage.value !== 1) {
      currentPage.value = 1;
    }
  },
);

watchEffect(() => {
  const dateStrings = Array.from(
    new Set(props.commons.flatMap((common) => Object.keys(common.availabilities))),
  );
  dateStrings.sort();
  const lastDate = dateStrings.at(-1);
  if (lastDate && lastDate > latestAvailability.value) {
    latestAvailability.value = lastDate;
  }
});

function moveColumnHighlight(event: MouseEvent) {
  if (!event.target || !(event.target instanceof HTMLElement)) return;
  const cell: HTMLTableCellElement =
    event.target instanceof HTMLTableCellElement && event.target.matches('.cb-acal-day')
      ? event.target
      : (event.target.closest('.cb-acal-day') as HTMLTableCellElement);
  activeColIndex.value = cell
    ? [...(cell.parentNode as HTMLTableRowElement).children].indexOf(cell)
    : 0;
}
</script>

<style lang="postcss">
:root {
  --cb-acal-column-name-color: var(--cb-layer-base-1-color);
  --cb-acal-column-name-width: 120px;
  --cb-acal-column-date-width: 35px;
  --cb-acal-column-padding-x: theme('spacing.2');
  --cb-acal-column-padding-y: theme('spacing.2');
  --cb-acal-border-color: 0 0% 0%;
  --cb-acal-border-color-header: hsl(var(--cb-acal-border-color) / 0.05);
  --cb-acal-border-color-rows: hsl(var(--cb-acal-border-color) / 0.03);
  --cb-acal-highlight-color: theme('colors.amber.50');
  --cb-acal-highlight-indicator-color: currentColor;
  --cb-acal-column-weekend-color: theme('colors.teal.50');
}

.cb-acal :is(th, td) {
  text-align: left;
  line-height: 1.2;
  border: 0 solid var(--cb-acal-border-color-header);
  padding: var(--cb-acal-column-padding-y) var(--cb-acal-column-padding-x);
  transition: background-color 100ms;
}

/* Border handling is a little tricky because Firefox doesn’t like border-collapse:collapse
 * along with sticky table cells. Thus we need to make sure to apply borders only to one side. */
.cb-acal-table {
  border: solid var(--cb-acal-border-color-header);
  border-width: 1px 0;
}
.cb-acal-month-border {
  /* We cant apply this border to the cell because it would vanish behind other sticky table cells.
   * We therefore have to anchor it to the month label and reposition it so it matches up with the cell. */
  position: absolute;
  left: calc(var(--cb-acal-column-padding-x) * -1);
  top: calc(var(--cb-acal-column-padding-y) * -1);
  height: v-bind(tableHeadHeightPx);
  background-color: var(--cb-acal-border-color-header);
  width: 1px;
}
.cb-acal :is(td, th):last-child {
  border-right-width: 1px;
}
.cb-acal tbody tr:not(:last-child) :is(td, th) {
  border-bottom-width: 1px;
  border-bottom-color: var(--cb-acal-border-color-rows);
}

/* force fixed width and wrapping on large data cells, so they don’t take all the horizontal space  */
.cb-acal-name,
.cb-acal-location {
  min-width: var(--cb-acal-column-name-width);
  width: var(--cb-acal-column-name-width);
  word-wrap: break-word;
}

.cb-acal .cb-acal-day {
  text-align: center;
  vertical-align: middle;
  width: var(--cb-acal-column-date-width);
}

.cb-acal thead :is(th, td):not(.cb-acal-day):not(.cb-acal-name) {
  background-color: white;
}

/* remove the padding for date-availability cells so that we get get a continuous timeline */
.cb-acal td.cb-acal-day {
  padding-inline: 0;
}
.cb-acal td.cb-acal-day > span {
  padding-inline: var(--cb-acal-column-padding-x);
}

/* indicate weekends for better orientation */
col.cb-acal-day--sat,
col.cb-acal-day--sun {
  background-color: var(--cb-acal-column-weekend-color);
}

/* highlight rows on hover */
.cb-acal tbody tr:hover :is(td, th) {
  background-color: var(--cb-acal-highlight-color);
}

/* sticky headers */
.cb-acal-name {
  position: sticky;
  left: 0;
  background-color: var(--cb-acal-column-name-color);
  z-index: 1;
}
.cb-acal thead tr:last-child {
  position: sticky;
  top: 0;
  left: 0;
}
</style>

<i18n lang="yaml">
de:
  name: Name
  location: Ort
  pagination: Seitenummerierung für Verfügbarkeitskalender

en:
  name: Name
  location: Location
  pagination: Pagination für availability calendar
</i18n>
