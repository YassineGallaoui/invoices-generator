<script setup lang="ts">
import type { InvoiceConfig, ItemsSection } from "~/types/invoice";
// formatAmount is auto-imported from app/utils/formatCurrency by Nuxt

const props = defineProps<{
  section: ItemsSection;
  config: InvoiceConfig;
}>();

function fmtAmount(n: number) {
  return formatAmount(n, props.config.currency, props.config.locale);
}

const totals = computed(() =>
  props.section.items.map((item) => item.unitPrice * item.quantity),
);
const grandTotal = computed(() =>
  totals.value.reduce((s, t) => s + t, 0),
);

const qtyHeader = computed(() =>
  props.section.unit ? `QTY (${props.section.unit})` : "QTY",
);
</script>

<template>
  <table :class="$style.table">
    <thead>
      <tr>
        <th
          data-header
          :class="[$style.header, $style.left]"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >DESCRIPTION</th>
        <th
          data-header
          :class="[$style.header, $style.right, $style.narrow]"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >UNIT PRICE</th>
        <th
          data-header
          :class="[$style.header, $style.right, $style.narrow]"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >{{ qtyHeader }}</th>
        <th
          data-header
          :class="[$style.header, $style.right, $style.narrow]"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >TOTAL</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in section.items" :key="item.id" :class="$style.itemsRow">
        <td :class="$style.cell" :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }">
          {{ item.description }}
        </td>
        <!-- Unit price -->
        <td :class="[$style.cell, $style.right, $style.narrow]" :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }">
          {{ fmtAmount(item.unitPrice).symbol }}&nbsp;{{ fmtAmount(item.unitPrice).whole }}<span :style="{ fontSize: `calc(${config.baseFontPx} * 0.8px)` }">.{{ fmtAmount(item.unitPrice).cents }}</span>
        </td>
        <!-- Qty -->
        <td :class="[$style.cell, $style.right, $style.narrow]" :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }">
          {{ item.quantity }}
        </td>
        <!-- Row total -->
        <td :class="[$style.cell, $style.right, $style.narrow]" :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }">
          {{ fmtAmount(totals[i]!).symbol }}&nbsp;{{ fmtAmount(totals[i]!).whole }}<span :style="{ fontSize: `calc(${config.baseFontPx} * 0.8px)` }">.{{ fmtAmount(totals[i]!).cents }}</span>
        </td>
      </tr>

      <!-- Spacer row -->
      <tr :class="$style.spacer" aria-hidden="true"><td colspan="4"></td></tr>

      <!-- Grand total row -->
      <tr>
        <td colspan="3"></td>
        <td :class="[$style.cell, $style.right, $style.totalCell]" :style="{ fontSize: `calc(${config.primaryInfoPx} * 1px)` }">
          <span :class="$style.totalLabel">Total:&nbsp;</span>{{ fmtAmount(grandTotal).symbol }}&nbsp;{{ fmtAmount(grandTotal).whole }}<span :style="{ fontSize: `calc(${config.primaryInfoPx} * 0.8px)` }">.{{ fmtAmount(grandTotal).cents }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style module lang="scss">
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5em;
}

.header {
  font-weight: 700;
  padding: 0.4em 0;
  vertical-align: bottom;
  white-space: nowrap;
  text-align: left;
  border-bottom: 1px solid #777
}

.itemsRow {
  border-bottom: 1px dashed #ccc
}

.cell {
  padding: 0.25em 0 0.25em;
  vertical-align: top;
}

.left {
  text-align: left;
}

.right {
  text-align: right;
}

.narrow {
  width: 1%;
  white-space: nowrap;
  padding-left: 1em;
}

.spacer td {
  height: 0.75em;
}

.totalCell {
  padding-top: 0.5em;
}

.totalLabel {
  font-weight: 700;
}
</style>
