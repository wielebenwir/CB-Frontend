<template>
  <CommonsSearchDemo />
</template>

<script lang="ts" setup>
import CommonsSearchDemo from './commons-search/demo/CommonsSearchDemo.vue';
</script>

<style>
:root {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    Segoe UI Symbol, 'Noto Color Emoji';
  font-feature-settings: normal;
  font-variation-settings: normal;

  /* cspell:disable */
  --commonsbooking-color-primary: #84ae53;
  --commonsbooking-color-secondary: #506ca9;
  --commonsbooking-color-buttons: #74ce3c;
  --commonsbooking-color-accept: #74ce3c;
  --commonsbooking-color-cancel: #d5425c;
  --commonsbooking-color-holiday: #ff9218;
  --commonsbooking-color-greyedout: #e0e0e0;
  --commonsbooking-color-bg: #f9f9f9;
  --commonsbooking-color-noticebg: #fff9c5;
  --commonsbooking-textcolor-light: #c4c4c4;
  --commonsbooking-textcolor-dark: #000;
  --commonsbooking-color-gray-background: #f9f9f9;
  --commonsbooking-color-gray-border: #f6f6f6;
  --commonsbooking-color-error: #d5425c;
  --commonsbooking-color-success: #74ce3c;
  --commonsbooking-color-warning: #ff9218;
  --commonsbooking-font-size-small: 12px;
  --commonsbooking-font-line-height-small: 13px;
  --commonsbooking-font-size-normal: 14px;
  --commonsbooking-font-size-big: 18px;
  --commonsbooking-font-size-huge: 24px;
  --commonsbooking-spacer-big: 15px;
  --commonsbooking-spacer: 10px;
  --commonsbooking-spacer-small: 5px;
  --commonsbooking-radius: 8px;
  --commonsbooking-radius-pill: 8px;
  /* cspell:enable */
}

body {
  margin: 0;
}
</style>
