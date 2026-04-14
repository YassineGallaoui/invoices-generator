<script setup lang="ts">
import type { Party } from "~/types/invoice";

const props = defineProps<{ from: Party; to: Party }>();
const emit = defineEmits<{
  "update:from": [value: Party];
  "update:to": [value: Party];
}>();

const {
  presets,
  saveBusinessPreset,
  updateBusinessPreset,
  deleteBusinessPreset: _db,
  saveClientPreset,
  updateClientPreset,
  deleteClientPreset: _dc,
} = usePresets();

function patchFrom(partial: Partial<Party>) {
  emit("update:from", { ...props.from, ...partial });
}
function patchTo(partial: Partial<Party>) {
  emit("update:to", { ...props.to, ...partial });
}

// ── FROM preset actions ──────────────────────────────────────────────────────
function loadBusiness(id: string) {
  const p = presets.value.businesses.find((b) => b.id === id);
  if (p) emit("update:from", { ...p, id: props.from.id });
}
function saveBusiness(label: string) {
  saveBusinessPreset(props.from, label);
}
function updateBusiness(id: string) {
  const existing = presets.value.businesses.find((b) => b.id === id);
  if (existing) updateBusinessPreset(id, props.from, existing.label);
}

// ── TO preset actions ────────────────────────────────────────────────────────
function loadClient(id: string) {
  const p = presets.value.clients.find((c) => c.id === id);
  if (p) emit("update:to", { ...p, id: props.to.id });
}
function saveClient(label: string) {
  saveClientPreset(props.to, label);
}
function updateClient(id: string) {
  const existing = presets.value.clients.find((c) => c.id === id);
  if (existing) updateClientPreset(id, props.to, existing.label);
}
</script>

<template>
  <section :class="$style.section">
    <AppSectionHeading>From / To</AppSectionHeading>

    <div :class="$style.twoCol">
      <!-- FROM -->
      <div :class="$style.col">
        <p :class="$style.colTitle">FROM (you)</p>
        <FormPresetBar
          :presets="presets.businesses"
          save-placeholder="e.g. My Studio"
          @select="loadBusiness"
          @update="updateBusiness"
          @save="saveBusiness"
        />
        <FormInput :model-value="from.name" label="Name / Company" @update:model-value="patchFrom({ name: $event })" />
        <FormInput :model-value="from.address1" label="Address line 1" @update:model-value="patchFrom({ address1: $event })" />
        <FormInput :model-value="from.address2" label="Address line 2" @update:model-value="patchFrom({ address2: $event })" />
        <FormInput :model-value="from.vatNumber" label="VAT Number" @update:model-value="patchFrom({ vatNumber: $event })" />
        <FormInput :model-value="from.cf" label="Codice Fiscale" placeholder="CF" @update:model-value="patchFrom({ cf: $event })" />
        <FormInput :model-value="from.email" label="Email" type="email" @update:model-value="patchFrom({ email: $event })" />
        <FormInput :model-value="from.phone" label="Phone" type="tel" @update:model-value="patchFrom({ phone: $event })" />
      </div>

      <!-- TO -->
      <div :class="$style.col">
        <p :class="$style.colTitle">TO (client)</p>
        <FormPresetBar
          :presets="presets.clients"
          save-placeholder="e.g. Acme Corp"
          @select="loadClient"
          @update="updateClient"
          @save="saveClient"
        />
        <FormInput :model-value="to.name" label="Name / Company" @update:model-value="patchTo({ name: $event })" />
        <FormInput :model-value="to.address1" label="Address line 1" @update:model-value="patchTo({ address1: $event })" />
        <FormInput :model-value="to.address2" label="Address line 2" @update:model-value="patchTo({ address2: $event })" />
        <FormInput :model-value="to.vatNumber" label="VAT Number" @update:model-value="patchTo({ vatNumber: $event })" />
        <FormInput :model-value="to.cf" label="Codice Fiscale" placeholder="CF" @update:model-value="patchTo({ cf: $event })" />
        <FormInput :model-value="to.email" label="Email" type="email" @update:model-value="patchTo({ email: $event })" />
        <FormInput :model-value="to.phone" label="Phone" type="tel" @update:model-value="patchTo({ phone: $event })" />
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
  border-bottom: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
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
