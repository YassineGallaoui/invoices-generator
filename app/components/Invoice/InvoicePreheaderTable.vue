<script setup lang="ts">
import type { Preheader, InvoiceConfig } from "~/types/invoice";

const props = defineProps<{
  preheader: Preheader;
  config: InvoiceConfig;
}>();

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(props.config.locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso + "T00:00:00"));
  } catch {
    return iso;
  }
}
</script>

<template>
  <table :class="$style.table">
    <tbody>
      <tr>
        <!-- LEFT: text title or logo -->
        <td :class="$style.left">
          <span
            v-if="preheader.kind === 'text'"
            :class="$style.title"
            :style="{ fontSize: `calc(${config.preheaderTextPx} * 1px)` }"
          >
            {{ preheader.text || "Invoice" }}
          </span>
          <img
            v-else-if="preheader.logoDataUrl"
            :src="preheader.logoDataUrl"
            alt="Invoice logo"
            :class="$style.logo"
            width="120"
            height="60"
          />
        </td>

        <!-- RIGHT: invoice number + date, right-aligned -->
        <td :class="$style.right">
          <div
            v-if="preheader.invoiceNumber"
            :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }"
          >
            {{ preheader.invoiceNumber }}
          </div>
          <div
            v-if="preheader.invoiceDate"
            :style="{ fontSize: `calc(${config.baseFontPx} * 1px)` }"
          >
            {{ formatDate(preheader.invoiceDate) }}
          </div>
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

.left {
  vertical-align: middle;
  padding: 0;
}

.title {
  font-weight: 400;
  line-height: 1.2;
  display: block;
}

.logo {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
  display: block;
}

.right {
  text-align: right;
  vertical-align: middle;
  padding: 0;
  white-space: nowrap;
  width: 1%; // shrink to content
}
</style>
