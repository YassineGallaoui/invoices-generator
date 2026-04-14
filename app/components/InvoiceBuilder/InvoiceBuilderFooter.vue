<script setup lang="ts">
import type { PaymentDetails } from "~/types/invoice";

const props = defineProps<{ payment: PaymentDetails; notesHtml: string }>();
const emit = defineEmits<{
  "update:payment": [value: PaymentDetails];
  "update:notesHtml": [value: string];
}>();

const { presets, savePaymentPreset, updatePaymentPreset, saveNotePreset, updateNotePreset } = usePresets();

function patchPayment(partial: Partial<PaymentDetails>) {
  emit("update:payment", { ...props.payment, ...partial });
}

// ── Payment preset actions ───────────────────────────────────────────────────
function loadPayment(id: string) {
  const p = presets.value.paymentMethods.find((m) => m.id === id);
  if (p) emit("update:payment", { ...p, id: props.payment.id });
}
function savePayment(label: string) {
  savePaymentPreset(props.payment, label);
}
function updatePayment(id: string) {
  const existing = presets.value.paymentMethods.find((m) => m.id === id);
  if (existing) updatePaymentPreset(id, props.payment, existing.label);
}

// ── Note preset actions ──────────────────────────────────────────────────────
function loadNote(id: string) {
  const n = presets.value.notes.find((x) => x.id === id);
  if (n) emit("update:notesHtml", n.html);
}
function saveNote(label: string) {
  saveNotePreset(props.notesHtml, label);
}
function updateNote(id: string) {
  const existing = presets.value.notes.find((n) => n.id === id);
  if (existing) updateNotePreset(id, props.notesHtml, existing.label);
}
</script>

<template>
  <section :class="$style.section">
    <AppSectionHeading>Payment Details &amp; Notes</AppSectionHeading>

    <div :class="$style.twoCol">
      <div :class="$style.col">
        <p :class="$style.colTitle">Payment Details</p>
        <FormPresetBar
          :presets="presets.paymentMethods"
          save-placeholder="e.g. Main bank account"
          @select="loadPayment"
          @update="updatePayment"
          @save="savePayment"
        />
        <FormInput
          :model-value="payment.iban"
          label="IBAN"
          placeholder="DE89370400440532013000"
          @update:model-value="patchPayment({ iban: $event })"
        />
        <FormInput
          :model-value="payment.bicSwift"
          label="BIC / SWIFT"
          placeholder="COBADEFFXXX"
          @update:model-value="patchPayment({ bicSwift: $event })"
        />
        <FormInput
          :model-value="payment.extra"
          label="Additional info"
          @update:model-value="patchPayment({ extra: $event })"
        />
      </div>

      <div :class="$style.col">
        <p :class="$style.colTitle">Notes</p>
        <FormPresetBar
          :presets="presets.notes"
          save-placeholder="e.g. Standard payment terms"
          @select="loadNote"
          @update="updateNote"
          @save="saveNote"
        />
        <FormRichText
          :model-value="notesHtml"
          label="Notes"
          placeholder="Payment due within 30 days…"
          @update:model-value="emit('update:notesHtml', $event)"
        />
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
}

.twoCol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.colTitle {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
  margin: 0 0 0.15rem;
}
</style>
