<script setup lang="ts">
import type { InvoiceConfig, Party } from "~/types/invoice";

defineProps<{
  from: Party;
  to: Party;
  config: InvoiceConfig;
}>();
</script>

<template>
  <table :class="$style.table">
    <thead>
      <tr>
        <th
          data-header
          :class="$style.header"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >FROM</th>
        <th
          data-header
          :class="[$style.header, $style.right]"
          :style="{ fontSize: `calc(${config.tableHeaderPx} * 1px)` }"
        >TO</th>
      </tr>
    </thead>
    <tbody>
      <!-- Row 1: headers (9px bold) -->
      <!-- Row 2: primary name (14px bold) -->
      <tr>
        <td
          :class="$style.primary"
          :style="{ fontSize: `calc(${config.primaryInfoPx} * 1px)` }"
        >{{ from.name }}</td>
        <td
          :class="[$style.primary, $style.right]"
          :style="{ fontSize: `calc(${config.primaryInfoPx} * 1px)` }"
        >{{ to.name }}</td>
      </tr>
      <!-- Row 3+: secondary info -->
      <tr>
        <td :class="$style.secondary" :style="{ fontSize: `calc(${config.secondaryInfoPx} * 1px)` }">
          <div v-if="from.address1">{{ from.address1 }}</div>
          <div v-if="from.address2">{{ from.address2 }}</div>
          <div v-if="from.vatNumber">{{ from.vatNumber }}</div>
          <div v-if="from.cf">{{ from.cf }}</div>
          <div v-if="from.email">{{ from.email }}</div>
          <div v-if="from.phone">{{ from.phone }}</div>
          <div v-for="(line, i) in from.extra" :key="i">{{ line }}</div>
        </td>
        <td :class="[$style.secondary, $style.right]" :style="{ fontSize: `calc(${config.secondaryInfoPx} * 1px)` }">
          <div v-if="to.address1">{{ to.address1 }}</div>
          <div v-if="to.address2">{{ to.address2 }}</div>
          <div v-if="to.vatNumber">{{ to.vatNumber }}</div>
          <div v-if="to.cf">{{ to.cf }}</div>
          <div v-if="to.email">{{ to.email }}</div>
          <div v-if="to.phone">{{ to.phone }}</div>
          <div v-for="(line, i) in to.extra" :key="i">{{ line }}</div>
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
  padding: 0 0 0.2em;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid #777
}

.primary {
  font-weight: 700;
  padding: 0 0 0.2em;
  vertical-align: top;
}

.secondary {
  padding: 0;
  vertical-align: top;
  line-height: 1.6;
}

.right {
  text-align: right;
}
</style>
