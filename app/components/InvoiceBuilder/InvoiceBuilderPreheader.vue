<script setup lang="ts">
import type { InvoiceConfig, Preheader } from "~/types/invoice";

const props = defineProps<{
  modelValue: Preheader;
  config: InvoiceConfig;
}>();
const emit = defineEmits<{ "update:modelValue": [value: Preheader] }>();

const local = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function patch(partial: Partial<Preheader>) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}
</script>

<template>
  <section :class="$style.section">
    <AppSectionHeading>Preheader</AppSectionHeading>

    <!-- Toggle: text / logo -->
    <fieldset :class="$style.kindGroup">
      <legend :class="$style.kindLegend">Left column</legend>
      <div :class="$style.kindOptions">
        <label :class="$style.kindOption">
          <input
            type="radio"
            value="text"
            :checked="local.kind === 'text'"
            :class="$style.radio"
            @change="patch({ kind: 'text' })"
          />
          <span>Title text</span>
        </label>
        <label :class="$style.kindOption">
          <input
            type="radio"
            value="logo"
            :checked="local.kind === 'logo'"
            :class="$style.radio"
            @change="patch({ kind: 'logo' })"
          />
          <span>Logo image</span>
        </label>
      </div>
    </fieldset>

    <!-- Text title -->
    <FormInput
      v-if="local.kind === 'text'"
      :model-value="local.text"
      label="Title"
      placeholder="Invoice"
      @update:model-value="patch({ text: $event })"
    />

    <!-- Logo -->
    <FormFileImage
      v-else
      :model-value="local.logoDataUrl"
      label="Logo"
      :max-size-mb="2"
      @update:model-value="patch({ logoDataUrl: $event })"
    />

    <!-- Right column fields -->
    <div :class="$style.row">
      <FormInput
        :model-value="local.invoiceNumber"
        label="Invoice Number"
        placeholder="INV-001"
        @update:model-value="patch({ invoiceNumber: $event })"
      />
      <FormInput
        :model-value="local.invoiceDate"
        label="Date"
        type="date"
        @update:model-value="patch({ invoiceDate: $event })"
      />
    </div>
  </section>
</template>

<style module lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
}

.kindGroup {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1rem;
}

.kindLegend {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  margin-bottom: 0.4rem;
  float: left;
  width: 100%;
}

.kindOptions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.kindOption {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.radio {
  accent-color: #ffe44d;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
