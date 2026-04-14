<script setup lang="ts">
import type { InvoiceConfig, PaymentDetails } from "~/types/invoice";

defineProps<{
  payment: PaymentDetails;
  notesHtml: string;
  config: InvoiceConfig;
}>();
</script>

<template>
  <table :class="$style.table">
    <thead>
      <!-- Headers (9px bold) -->
      <tr>
        <th
          data-header
          :class="$style.header"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >PAYMENT DETAILS</th>
        <th
          data-header
          :class="$style.header"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >NOTES</th>
      </tr>
    </thead>
    <tbody>
      <!-- Content -->
      <tr>
        <td :class="$style.cell" :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }">
          <div v-if="payment.iban">
            <span :class="$style.fieldLabel">IBAN:</span> {{ payment.iban }}
          </div>
          <div v-if="payment.bicSwift">
            <span :class="$style.fieldLabel">BIC/SWIFT:</span> {{ payment.bicSwift }}
          </div>
          <div v-if="payment.extra">{{ payment.extra }}</div>
        </td>
        <!-- Notes: rich HTML (sanitized via sanitizeHtml allowlist before storage) -->
        <!-- eslint-disable-next-line vue/no-v-html -- content is sanitized by sanitizeHtml() before being stored -->
        <td
          :class="[$style.cell, $style.notesCell]"
          :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }"
          v-html="notesHtml"
        />
      </tr>
    </tbody>
  </table>
</template>

<style module lang="scss">
.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table td {
  width: 50%;
}

.header {
  font-weight: 700;
  padding: 0 0 0.3em;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid #777
}

.cell {
  padding: 0;
  vertical-align: top;
  line-height: 1.6;
}

.right {
  text-align: right;
}

.fieldLabel {
  font-weight: 600;
}

// Notes cell: pass rich text formatting through
.notesCell :deep(p) {
  margin: 0 0 0.3em;
}
.notesCell :deep(ul),
.notesCell :deep(ol) {
  margin: 0;
  padding-left: 1.2em;
}
.notesCell :deep(li) {
  margin: 0;
}
</style>
