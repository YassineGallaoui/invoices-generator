<script setup lang="ts">
/**
 * Reusable preset toolbar.
 *
 * Events:
 *   select(id)   — user chose a preset and clicked Load
 *   update(id)   — user wants to overwrite the selected preset with current data
 *   save(label)  — user confirmed a new preset name
 */
const props = defineProps<{
  presets: Array<{ id: string; label: string }>;
  savePlaceholder?: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  update: [id: string];
  save: [label: string];
}>();

const selectedId = ref("");
const saving = ref(false);
const newLabel = ref("");
const nameInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.presets,
  (list) => {
    if (selectedId.value && !list.find((p) => p.id === selectedId.value)) {
      selectedId.value = "";
    }
  },
);

function load() {
  if (selectedId.value) emit("select", selectedId.value);
}

function updatePreset() {
  if (selectedId.value) emit("update", selectedId.value);
}

async function openSave() {
  newLabel.value = "";
  saving.value = true;
  await nextTick();
  nameInput.value?.focus();
}

function confirmSave() {
  const label = newLabel.value.trim();
  if (!label) return;
  emit("save", label);
  saving.value = false;
  newLabel.value = "";
}

function cancelSave() {
  saving.value = false;
  newLabel.value = "";
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") confirmSave();
  if (e.key === "Escape") cancelSave();
}
</script>

<template>
  <div :class="$style.bar">
    <!-- Load flow -->
    <template v-if="!saving">
      <select
        v-if="presets.length > 0"
        v-model="selectedId"
        :class="$style.select"
        aria-label="Select a preset"
      >
        <option value="" disabled>Load preset…</option>
        <option v-for="p in presets" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
      <button
        v-if="presets.length > 0"
        type="button"
        :class="$style.btn"
        :disabled="!selectedId"
        @click="load"
      >
        Load
      </button>
      <button
        v-if="presets.length > 0 && selectedId"
        type="button"
        :class="[$style.btn, $style.btnUpdate]"
        :title="`Overwrite '${presets.find(p => p.id === selectedId)?.label}' with current data`"
        @click="updatePreset"
      >
        <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
        Update preset
      </button>
      <button
        type="button"
        :class="[$style.btn, $style.btnSave]"
        @click="openSave"
      >
        <Icon name="ph:floppy-disk" aria-hidden="true" />
        Save as preset
      </button>
    </template>

    <!-- Save flow -->
    <template v-else>
      <input
        ref="nameInput"
        v-model="newLabel"
        type="text"
        :class="$style.nameInput"
        :placeholder="savePlaceholder ?? 'Preset name…'"
        aria-label="Preset name"
        @keydown="onKeydown"
      />
      <button
        type="button"
        :class="[$style.btn, $style.btnConfirm]"
        :disabled="!newLabel.trim()"
        @click="confirmSave"
      >
        <Icon name="ph:check" aria-hidden="true" />
        Save
      </button>
      <button
        type="button"
        :class="$style.btn"
        @click="cancelSave"
      >
        Cancel
      </button>
    </template>
  </div>
</template>

<style module lang="scss">
.bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.select {
  flex: 1;
  min-width: 110px;
  max-width: 200px;
  padding: 0.3rem 0.5rem;
  font-size: 0.78rem;
  font-family: inherit;
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 6px;
  color: var(--foreground-color);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus { border-color: #ffe44d; }
}

.nameInput {
  flex: 1;
  min-width: 130px;
  padding: 0.3rem 0.55rem;
  font-size: 0.78rem;
  font-family: inherit;
  background-color: color-mix(in srgb, var(--foreground-color) 5%, transparent);
  border: 1px solid #ffe44d;
  border-radius: 6px;
  color: var(--foreground-color);
  outline: none;

  &::placeholder { color: color-mix(in srgb, var(--foreground-color) 30%, transparent); }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-family: inherit;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
    color: var(--foreground-color);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.btnSave {
  margin-left: auto;
  border-color: color-mix(in srgb, var(--foreground-color) 12%, transparent);
}

.btnUpdate {
  border-color: color-mix(in srgb, var(--foreground-color) 12%, transparent);
}

.btnConfirm {
  background-color: #ffe44d;
  border-color: #ffe44d;
  color: #1a1a1a;

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, #ffe44d 85%, #1a1a1a);
    border-color: color-mix(in srgb, #ffe44d 85%, #1a1a1a);
    color: #1a1a1a;
  }
}
</style>
