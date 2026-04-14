<script setup lang="ts">
import type { InvoiceConfig, ItemsSection, LineItem } from "~/types/invoice";

const props = defineProps<{ items: ItemsSection[]; config: InvoiceConfig }>();
const emit = defineEmits<{ "update:items": [value: ItemsSection[]] }>();

const { format } = useCurrencyFormat();

// ── Section operations ──────────────────────────────────────────────────────

function addSection() {
  emit("update:items", [
    ...props.items,
    {
      id: generateUUID(),
      unit: "",
      items: [{ id: generateUUID(), description: "", unitPrice: 0, quantity: 1 }],
    },
  ]);
}

function removeSection(sectionId: string) {
  emit("update:items", props.items.filter((s) => s.id !== sectionId));
}

function patchSection(sectionId: string, partial: Partial<ItemsSection>) {
  emit(
    "update:items",
    props.items.map((s) => (s.id === sectionId ? { ...s, ...partial } : s)),
  );
}

// ── Row operations ──────────────────────────────────────────────────────────

function addItem(sectionId: string) {
  const section = props.items.find((s) => s.id === sectionId)!;
  patchSection(sectionId, {
    items: [
      ...section.items,
      { id: generateUUID(), description: "", unitPrice: 0, quantity: 1 },
    ],
  });
}

function duplicateItem(sectionId: string, itemId: string) {
  const section = props.items.find((s) => s.id === sectionId)!;
  const idx = section.items.findIndex((i) => i.id === itemId);
  const copy: LineItem = { ...section.items[idx]!, id: generateUUID() };
  const next = [...section.items];
  next.splice(idx + 1, 0, copy);
  patchSection(sectionId, { items: next });
}

function removeItem(sectionId: string, itemId: string) {
  const section = props.items.find((s) => s.id === sectionId)!;
  patchSection(sectionId, {
    items: section.items.filter((i) => i.id !== itemId),
  });
}

function patchItem(sectionId: string, itemId: string, partial: Partial<LineItem>) {
  const section = props.items.find((s) => s.id === sectionId)!;
  patchSection(sectionId, {
    items: section.items.map((i) => (i.id === itemId ? { ...i, ...partial } : i)),
  });
}

// ── Totals ──────────────────────────────────────────────────────────────────

function sectionTotal(section: ItemsSection) {
  return section.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
}

function fmtTotal(section: ItemsSection) {
  return format(sectionTotal(section), props.config);
}
</script>

<template>
  <section :class="$style.wrapper">
    <div
      v-for="(section, si) in items"
      :key="section.id"
      :class="$style.section"
    >
      <!-- Section header: heading + unit + remove -->
      <div :class="$style.sectionHeader">
        <AppSectionHeading>
          Line Items{{ items.length > 1 ? ` ${si + 1}` : "" }}
        </AppSectionHeading>
        <div :class="$style.sectionMeta">
          <div :class="$style.unitField">
            <label :class="$style.unitLabel" :for="`unit-${section.id}`">Unit</label>
            <input
              :id="`unit-${section.id}`"
              type="text"
              :value="section.unit"
              :class="$style.unitInput"
              placeholder="hours, days…"
              @input="patchSection(section.id, { unit: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <button
            v-if="items.length > 1"
            type="button"
            :class="$style.removeSectionBtn"
            aria-label="Remove this items table"
            @click="removeSection(section.id)"
          >
            <Icon name="ph:trash" aria-hidden="true" />
            Remove table
          </button>
        </div>
      </div>

      <!-- Column labels -->
      <div :class="$style.colLabels" aria-hidden="true">
        <span :class="$style.colDesc">Description</span>
        <span :class="$style.colNum">Unit price</span>
        <span :class="$style.colNum">{{ section.unit ? `Qty (${section.unit})` : "Qty" }}</span>
        <span :class="$style.colActions" />
      </div>

      <!-- Item rows -->
      <div
        v-for="item in section.items"
        :key="item.id"
        :class="$style.itemRow"
      >
        <FormInput
          :model-value="item.description"
          label="Description"
          :hide-label="true"
          placeholder="Service or product"
          :class="$style.colDesc"
          @update:model-value="patchItem(section.id, item.id, { description: $event })"
        />
        <FormNumber
          :model-value="item.unitPrice"
          label="Unit price"
          :hide-label="true"
          :min="0"
          :step="0.01"
          :class="$style.colNum"
          @update:model-value="patchItem(section.id, item.id, { unitPrice: $event })"
        />
        <FormNumber
          :model-value="item.quantity"
          :label="section.unit ? `Qty (${section.unit})` : 'Qty'"
          :hide-label="true"
          :min="0"
          :step="0.25"
          :class="$style.colNum"
          @update:model-value="patchItem(section.id, item.id, { quantity: $event })"
        />
        <div :class="[$style.colActions, $style.rowActions]">
          <button
            type="button"
            :class="$style.iconBtn"
            aria-label="Duplicate row"
            @click="duplicateItem(section.id, item.id)"
          >
            <Icon name="ph:copy" aria-hidden="true" />
          </button>
          <button
            type="button"
            :class="[$style.iconBtn, $style.iconBtnDanger]"
            aria-label="Remove row"
            :disabled="section.items.length === 1"
            @click="removeItem(section.id, item.id)"
          >
            <Icon name="ph:trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Add row + running total -->
      <div :class="$style.sectionFooter">
        <button type="button" :class="$style.addRowBtn" @click="addItem(section.id)">
          <Icon name="ph:plus" aria-hidden="true" />
          Add row
        </button>
        <span :class="$style.sectionTotal">
          {{ fmtTotal(section).symbol }}&nbsp;{{ fmtTotal(section).whole }}<span :class="$style.cents">.{{ fmtTotal(section).cents }}</span>
        </span>
      </div>
    </div>

    <!-- Add table button -->
    <button type="button" :class="$style.addTableBtn" @click="addSection">
      <Icon name="ph:table" aria-hidden="true" />
      Add items table
    </button>
  </section>
</template>

<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  margin-bottom: 1.25rem;
}

// Section header row: heading + unit input + optional remove button
.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sectionMeta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.unitField {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.unitLabel {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  white-space: nowrap;
}

.unitInput {
  width: 100px;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
  font-family: inherit;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  background: transparent;
  color: var(--foreground-color);
  outline: none;
  transition: border-color 0.15s ease;

  &:focus { border-color: color-mix(in srgb, var(--foreground-color) 50%, transparent); }
  &::placeholder { color: color-mix(in srgb, var(--foreground-color) 30%, transparent); }
}

.removeSectionBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: inherit;
  color: color-mix(in srgb, #d94040 70%, transparent);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: #d94040;
    background-color: color-mix(in srgb, #d94040 8%, transparent);
  }

  &:focus-visible { outline: 2px solid #d94040; outline-offset: 2px; }
}

// Column label bar (above item rows)
.colLabels {
  display: grid;
  grid-template-columns: 1fr 90px 80px 60px;
  gap: 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  padding: 0 0 0.15rem;
}

// Each item row
.itemRow {
  display: grid;
  grid-template-columns: 1fr 90px 80px 60px;
  gap: 0.5rem;
  align-items: start;
}

.colDesc { grid-column: 1; }
.colNum  { }
.colActions { display: flex; align-items: center; }

.rowActions {
  padding-top: 0.2rem; // visual alignment with inputs
  gap: 0.2rem;
}

.iconBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
  transition: color 0.12s ease, background-color 0.12s ease;

  &:hover { color: var(--foreground-color); background-color: color-mix(in srgb, var(--foreground-color) 8%, transparent); }
  &:disabled { opacity: 0.25; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.iconBtnDanger {
  &:hover { color: #d94040; background-color: color-mix(in srgb, #d94040 10%, transparent); }
}

// Section footer: add row + total
.sectionFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.25rem;
}

.addRowBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--foreground-color) 22%, transparent);
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.sectionTotal {
  font-weight: 700;
  font-size: 0.95rem;
}

.cents {
  font-size: 0.8em;
}

// Add table button (bottom of all sections)
.addTableBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--foreground-color) 22%, transparent);
  border-radius: 6px;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  align-self: flex-start;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}
</style>
