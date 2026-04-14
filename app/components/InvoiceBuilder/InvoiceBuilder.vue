<script setup lang="ts">
import type { Invoice, InvoiceConfig } from "~/types/invoice";
import InvoiceBuilderFooter from "./InvoiceBuilderFooter.vue";
import InvoiceBuilderItems from "./InvoiceBuilderItems.vue";
import InvoiceBuilderParties from "./InvoiceBuilderParties.vue";
import InvoiceBuilderPreheader from "./InvoiceBuilderPreheader.vue";

const props = defineProps<{ modelValue: Invoice }>();
const emit = defineEmits<{ "update:modelValue": [value: Invoice] }>();

function patch(partial: Partial<Invoice>) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

function patchConfig(partial: Partial<InvoiceConfig>) {
  patch({ config: { ...props.modelValue.config, ...partial } });
}

const currencyOptions = [
  { value: "$", label: "$ — USD / generic" },
  { value: "€", label: "€ — EUR" },
  { value: "£", label: "£ — GBP" },
  { value: "¥", label: "¥ — JPY / CNY" },
  { value: "CHF", label: "CHF" },
  { value: "kr", label: "kr — SEK / NOK / DKK" },
];

const localeOptions = [
  { value: "en-US", label: "en-US — 1,234.56" },
  { value: "en-GB", label: "en-GB — 1,234.56" },
  { value: "de-DE", label: "de-DE — 1.234,56" },
  { value: "fr-FR", label: "fr-FR — 1 234,56" },
  { value: "it-IT", label: "it-IT — 1.234,56" },
  { value: "ja-JP", label: "ja-JP" },
];
</script>

<template>
  <div :class="$style.builder">
    <InvoiceBuilderPreheader
      :model-value="modelValue.preheader"
      :config="modelValue.config"
      @update:model-value="patch({ preheader: $event })"
    />
    <InvoiceBuilderParties
      :from="modelValue.from"
      :to="modelValue.to"
      @update:from="patch({ from: $event })"
      @update:to="patch({ to: $event })"
    />
    <!-- Currency & locale: per-invoice -->
    <section :class="$style.currencySection">
      <AppSectionHeading>Currency &amp; Locale</AppSectionHeading>
      <div :class="$style.currencyGrid">
        <FormSelect
          label="Currency"
          :model-value="modelValue.config.currency"
          :options="currencyOptions"
          @update:model-value="patchConfig({ currency: $event })"
        />
        <FormSelect
          label="Number format"
          :model-value="modelValue.config.locale"
          :options="localeOptions"
          @update:model-value="patchConfig({ locale: $event })"
        />
      </div>
    </section>

    <InvoiceBuilderItems
      :items="modelValue.items"
      :config="modelValue.config"
      @update:items="patch({ items: $event })"
    />
    <InvoiceBuilderFooter
      :payment="modelValue.payment"
      :notes-html="modelValue.notesHtml"
      @update:payment="patch({ payment: $event })"
      @update:notes-html="patch({ notesHtml: $event })"
    />
  </div>
</template>

<style module lang="scss">
.builder {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
  height: 100%;
}

.currencySection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.currencyGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
