<script setup lang="ts">
import type { InvoiceConfig } from "~/types/invoice";

const props = defineProps<{ modelValue: InvoiceConfig }>();
const emit = defineEmits<{ "update:modelValue": [value: InvoiceConfig] }>();

function patch(partial: Partial<InvoiceConfig>) {
  emit("update:modelValue", { ...props.modelValue, ...partial });
}

// Re-applies the user's saved settings to this invoice only.
// Currency & locale are managed in their own section, so leave them alone.
function resetToDefaults() {
  const defaults = loadGlobalInvoiceConfig();
  patch({
    baseFontPx: defaults.baseFontPx,
    preheaderTextPx: defaults.preheaderTextPx,
    tableHeaderPx: defaults.tableHeaderPx,
    primaryInfoPx: defaults.primaryInfoPx,
    secondaryInfoPx: defaults.secondaryInfoPx,
    centsPx: defaults.centsPx,
    headerColor: defaults.headerColor,
    marginTop: defaults.marginTop,
    marginRight: defaults.marginRight,
    marginBottom: defaults.marginBottom,
    marginLeft: defaults.marginLeft,
  });
}
</script>

<template>
  <details :class="$style.section">
    <summary :class="$style.summary">
      <Icon name="ph:caret-right" aria-hidden="true" :class="$style.caret" />
      <span :class="$style.summaryLabel">Document Settings</span>
      <span :class="$style.summaryHint">fonts, margins, highlight color</span>
    </summary>

    <div :class="$style.body">
      <p :class="$style.hint">
        These values apply to this invoice only. New invoices start from your
        <NuxtLink to="/settings" :class="$style.settingsLink">Settings</NuxtLink>.
      </p>

      <!-- Font sizes -->
      <div :class="$style.group">
        <p :class="$style.groupTitle">Font Sizes (px)</p>
        <div :class="$style.grid">
          <FormNumber
            label="Base (body)"
            :model-value="modelValue.baseFontPx"
            :min="6"
            :max="24"
            @update:model-value="patch({ baseFontPx: $event })"
          />
          <FormNumber
            label="Preheader title"
            :model-value="modelValue.preheaderTextPx"
            :min="6"
            :max="36"
            @update:model-value="patch({ preheaderTextPx: $event })"
          />
          <FormNumber
            label="Table headers"
            :model-value="modelValue.tableHeaderPx"
            :min="6"
            :max="18"
            @update:model-value="patch({ tableHeaderPx: $event })"
          />
          <FormNumber
            label="Primary info (name)"
            :model-value="modelValue.primaryInfoPx"
            :min="6"
            :max="36"
            @update:model-value="patch({ primaryInfoPx: $event })"
          />
          <FormNumber
            label="Secondary info"
            :model-value="modelValue.secondaryInfoPx"
            :min="6"
            :max="24"
            @update:model-value="patch({ secondaryInfoPx: $event })"
          />
          <FormNumber
            label="Cents superscript"
            :model-value="modelValue.centsPx"
            :min="5"
            :max="16"
            @update:model-value="patch({ centsPx: $event })"
          />
        </div>
      </div>

      <!-- Header highlight color -->
      <div :class="$style.group">
        <p :class="$style.groupTitle">Header Highlight Color</p>
        <div :class="$style.colorRow">
          <div :class="$style.colorField">
            <label for="inv-header-color" :class="$style.colorLabel">Color</label>
            <input
              id="inv-header-color"
              type="color"
              :value="modelValue.headerColor || '#ffffff'"
              :class="$style.colorPicker"
              @input="patch({ headerColor: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div
            :class="$style.colorPreview"
            :style="{ backgroundColor: modelValue.headerColor || 'transparent' }"
          >
            <span>PREVIEW</span>
          </div>
          <button
            v-if="modelValue.headerColor"
            type="button"
            :class="$style.smallBtn"
            @click="patch({ headerColor: '' })"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Page margins -->
      <div :class="$style.group">
        <p :class="$style.groupTitle">PDF Page Margins (pt)</p>
        <div :class="$style.marginsGrid">
          <div />
          <FormNumber
            label="Top"
            :model-value="modelValue.marginTop"
            :min="0"
            :max="150"
            @update:model-value="patch({ marginTop: $event })"
          />
          <div />
          <FormNumber
            label="Left"
            :model-value="modelValue.marginLeft"
            :min="0"
            :max="150"
            @update:model-value="patch({ marginLeft: $event })"
          />
          <div :class="$style.marginCenter">A4</div>
          <FormNumber
            label="Right"
            :model-value="modelValue.marginRight"
            :min="0"
            :max="150"
            @update:model-value="patch({ marginRight: $event })"
          />
          <div />
          <FormNumber
            label="Bottom"
            :model-value="modelValue.marginBottom"
            :min="0"
            :max="150"
            @update:model-value="patch({ marginBottom: $event })"
          />
          <div />
        </div>
      </div>

      <button type="button" :class="$style.smallBtn" @click="resetToDefaults">
        <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
        Reset to my defaults
      </button>
    </div>
  </details>
</template>

<style module lang="scss">
.section {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  border-radius: 8px;
}

.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  cursor: pointer;
  list-style: none;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    background-color: color-mix(in srgb, var(--foreground-color) 4%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

.caret {
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  transition: transform 0.15s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  .section[open] & {
    transform: rotate(90deg);
  }
}

.summaryLabel {
  font-weight: 700;
  font-size: 0.85rem;
}

.summaryHint {
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
}

.body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 0.5rem 0.9rem 1.1rem;
  border-top: 1px solid color-mix(in srgb, var(--foreground-color) 8%, transparent);
}

.hint {
  font-size: 0.78rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0.6rem 0 0;
}

.settingsLink {
  color: inherit;
  font-weight: 600;
  text-underline-offset: 2px;

  &:hover {
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

.group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.groupTitle {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.6rem;
}

.colorRow {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.colorField {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.colorLabel {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
}

.colorPicker {
  width: 56px;
  height: 36px;
  padding: 2px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.colorPreview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35em 0.7em;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #1a1a1a;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  min-width: 80px;
}

.smallBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--foreground-color);
    color: var(--foreground-color);
  }

  &:focus-visible {
    outline: 2px solid var(--foreground-color);
    outline-offset: 2px;
  }
}

// 3×3 compass layout for margins
.marginsGrid {
  display: grid;
  grid-template-columns: 1fr 110px 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.5rem;
  align-items: center;
  max-width: 360px;
}

.marginCenter {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1.414;
  background-color: color-mix(in srgb, var(--foreground-color) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
  letter-spacing: 0.05em;
}
</style>
