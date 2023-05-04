<template>
  <div class="cb-acal tw-overflow-auto tw-max-h-full tw-relative">
    <table class="cb-acal-table tw-table-fixed tw-border-spacing-0 tw-rounded">
      <colgroup>
        <col class="cb-acal-name" />
        <col class="cb-acal-location" />
        <col
          v-for="date in calendarDates"
          :key="date.getTime()"
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
                  <span class="cb-acal-faux-border" />
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
            v-for="(date, index) in calendarDates"
            :key="date.getTime()"
            class="tw-text-sm tw-relative tw-font-semibold !tw-border-b"
            :class="['cb-acal-day', `cb-acal-day--${days[date.getDay()]}`]"
            scope="col"
          >
            <span
              v-show="activeColIndex === index + 2"
              class="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-top-[2px] tw-border-[6px] tw-border-solid tw-border-transparent tw-border-t-[var(--cb-acal-highlight-indicator-color)] tw-aspect-square tw-inline-flex"
            />
            <span>
              {{ date.toLocaleDateString(locale, { day: '2-digit' }) }}
            </span>
          </th>
        </tr>
      </thead>
      <TransitionGroup
        name="cb-animate-list"
        tag="tbody"
        @mouseover="moveColumnHighlight"
        @mouseleave="activeColIndex = 0"
      >
        <tr v-for="common in commons" :key="common.id">
          <th class="cb-acal-name tw-font-semibold !tw-border-r" scope="row">
            <span class="tw-line-clamp-2">{{ common.name }}</span>
          </th>
          <td class="cb-acal-location">
            <span class="tw-line-clamp-2">{{ locationMap.get(common.locationId)?.name }}</span>
          </td>
          <td
            v-for="(date, index) in calendarDates"
            :key="date.getTime()"
            :class="[
              'cb-acal-day',
              `cb-acal-day--${days[date.getDay()]}`,
              { '!tw-border-l': index === 0 },
            ]"
          >
            <template v-if="common.availabilities[index]">
              <CBAvailability
                v-if="common.availabilities[index]"
                class="tw-w-full tw-block tw-h-3"
                :availability="common.availabilities[index]"
                no-label
              />
            </template>
            <span v-else>-</span>
          </td>
        </tr>
      </TransitionGroup>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '@rokoli/vue-tiny-i18n';
import { useElementSize } from '@vueuse/core';
import { computed, ref } from 'vue';
import { getDateMonths, iterDates, maxBy } from '../../util';
import { Common, CommonLocation, IdMap } from '../types';
import CBAvailability from './CBAvailability.vue';

const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const props = defineProps<{
  commons: Common[];
  locationMap: IdMap<CommonLocation>;
}>();
const { locale, t } = useI18n();

const tableHeadEl = ref<HTMLTableSectionElement | undefined>();
const { height: tableHeadHeight } = useElementSize(tableHeadEl);
const tableHeadHeightPx = computed(() => `${tableHeadHeight.value}px`);
const activeColIndex = ref<number>(0);
const latestAvailability = computed(() => {
  return (
    maxBy(
      new Set(props.commons.flatMap((common) => common.availabilities).map((a) => a.date)),
      (a, b) => a.getTime() > b.getTime(),
    ) ?? new Date()
  );
});
const calendarDates = computed(() => Array.from(iterDates(latestAvailability.value)));
const calendarMonths = computed(() => Array.from(getDateMonths(calendarDates.value)));

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
/*
  If you apply borders to the table be advised that position:sticky breaks table borders when using
  border-collapse:collapse in Firefox. You need to make sure that borders are only applied to
  either top or bottom and left or right.
*/
.cb-acal {
  --cb-acal-column-name-width: 120px;
  --cb-acal-column-padding-x: theme('spacing.2');
  --cb-acal-column-padding-y: theme('spacing.2');
  --cb-acal-border-color: 0 0% 0%;
  --cb-acal-border-color-header: hsl(var(--cb-acal-border-color) / 0.05);
  --cb-acal-border-color-rows: hsl(var(--cb-acal-border-color) / 0.03);
  --cb-acal-highlight-color: theme('colors.amber.50');
  --cb-acal-highlight-indicator-color: currentColor;
  --cb-acal-column-weekend-color: theme('colors.teal.50');
  --cb-acal-header-color: var(--cb-layer-base-1-color);
}

.cb-acal-table {
  border: solid var(--cb-acal-border-color-header);
  border-width: 1px 0;
}

.cb-acal-faux-border {
  position: absolute;
  left: calc(var(--cb-acal-column-padding-x) * -1);
  top: calc(var(--cb-acal-column-padding-y) * -1);
  height: v-bind(tableHeadHeightPx);
  background-color: var(--cb-acal-border-color-header);
  width: 1px;
}

.cb-acal :is(th, td) {
  text-align: left;
  line-height: 1.2;
  border: 0 solid var(--cb-acal-border-color-header);
  padding: var(--cb-acal-column-padding-y) var(--cb-acal-column-padding-x);
  transition: background-color 100ms;
}

.cb-acal-name {
  position: sticky;
  left: 0;
  background-color: var(--cb-acal-header-color);
}

.cb-acal thead tr:last-child {
  position: sticky;
  top: 0;
  left: 0;
}

.cb-acal-name,
.cb-acal-location {
  min-width: var(--cb-acal-column-name-width);
  max-width: var(--cb-acal-column-name-width);
  word-wrap: break-word;
}

.cb-acal thead :is(th, td):not(.cb-acal-day):not(.cb-acal-name) {
  background-color: white;
}

.cb-acal .cb-acal-day {
  text-align: center;
}

.cb-acal td.cb-acal-day {
  padding-inline: 0;
}

.cb-acal td.cb-acal-day > span {
  padding-inline: var(--cb-acal-column-padding-x);
}

.cb-acal :is(td, th):first-child {
  border-left-width: 1px;
}

.cb-acal :is(td, th):last-child {
  border-right-width: 1px;
}

col.col-acal-day {
  background: white;
}

col.cb-acal-day--sat,
col.cb-acal-day--sun {
  background-color: var(--cb-acal-column-weekend-color);
}

.cb-acal tbody tr:not(:last-child) :is(td, th) {
  border-bottom-width: 1px;
  border-bottom-color: var(--cb-acal-border-color-rows);
}

.cb-acal tbody tr:hover :is(td, th) {
  background-color: var(--cb-acal-highlight-color);
}
</style>

<i18n lang="yaml">
de:
  name: Name
  location: Ort

en:
  name: Name
  location: Location
</i18n>
