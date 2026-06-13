<script setup lang="ts">
import type { InvoiceConfig } from "~/types/invoice";
import { DEFAULT_INVOICE_CONFIG } from "~/types/invoice";

useSeoMeta({ title: "Settings — Invoice Generator" });

const { config } = useInvoiceConfig();

// The page edits a local draft; nothing is persisted until "Save" is clicked.
// `config` (the persisted global default) is the baseline we diff against.
const draft = ref<InvoiceConfig>(structuredClone(config.value));

// `config` hydrates from localStorage in its own onMounted — resync the draft
// once that has happened so the form shows the user's saved values.
onMounted(() => {
  draft.value = structuredClone(config.value);
});

const dirty = computed(
  () => JSON.stringify(draft.value) !== JSON.stringify(config.value),
);
const justSaved = ref(false);
watch(draft, () => { justSaved.value = false; }, { deep: true });

function save() {
  config.value = structuredClone(draft.value); // persists + applies via useInvoiceConfig
  justSaved.value = true;
}

// ── Reset-to-defaults confirmation modal ──────────────────────────────────────
const showResetModal = ref(false);
const resetConfirmRef = ref<HTMLButtonElement | null>(null);

watch(showResetModal, (open) => {
  if (open) nextTick(() => resetConfirmRef.value?.focus());
});

function confirmReset() {
  // Stage defaults into the draft; the user reviews and clicks Save to persist.
  draft.value = structuredClone(DEFAULT_INVOICE_CONFIG);
  showResetModal.value = false;
}

function onModalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") showResetModal.value = false;
}
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">Settings</h1>
      <div :class="$style.headerActions">
        <!-- Status pill -->
        <span v-if="dirty" :class="[$style.statusPill, $style.statusDirty]">
          <Icon name="ph:pencil-simple" aria-hidden="true" />
          Unsaved changes
        </span>
        <span v-else-if="justSaved" :class="[$style.statusPill, $style.statusSaved]">
          <Icon name="ph:check-circle" aria-hidden="true" />
          Saved
        </span>

        <button type="button" :class="$style.resetBtn" @click="showResetModal = true">
          Reset to defaults
        </button>
        <button
          type="button"
          :class="[$style.saveBtn, dirty && $style.saveBtnActive]"
          :disabled="!dirty"
          @click="save"
        >
          <Icon name="ph:floppy-disk" aria-hidden="true" />
          Save
        </button>
      </div>
    </header>

    <p :class="$style.intro">
      These values are used as the defaults for every new invoice. Each invoice
      keeps its own copy, which you can override from the editor's
      "Document Settings" section — changes here never affect existing invoices.
    </p>

    <ClientOnly>
      <template v-if="draft">
        <!-- Font sizes -->
        <section :class="$style.section">
          <AppSectionHeading>Font Sizes (px)</AppSectionHeading>
          <div :class="$style.grid">
            <FormNumber v-model="draft.baseFontPx" label="Base (body)" :min="6" :max="24" />
            <FormNumber v-model="draft.preheaderTextPx" label="Preheader title" :min="6" :max="36" />
            <FormNumber v-model="draft.tableHeaderPx" label="Table headers" :min="6" :max="18" />
            <FormNumber v-model="draft.primaryInfoPx" label="Primary info (name)" :min="6" :max="36" />
            <FormNumber v-model="draft.secondaryInfoPx" label="Secondary info" :min="6" :max="24" />
            <FormNumber v-model="draft.centsPx" label="Cents superscript" :min="5" :max="16" />
          </div>
        </section>

        <!-- Header highlight color -->
        <section :class="$style.section">
          <AppSectionHeading>Header Highlight Color</AppSectionHeading>
          <p :class="$style.hint">
            Applied to section labels: FROM, TO, DESCRIPTION, QTY, PAYMENT DETAILS, NOTES, etc.
            Leave empty for no highlight.
          </p>
          <div :class="$style.colorRow">
            <div :class="$style.colorField">
              <label for="header-color" :class="$style.colorLabel">Color</label>
              <input
                id="header-color"
                type="color"
                :value="draft.headerColor || '#ffffff'"
                :class="$style.colorPicker"
                @input="draft.headerColor = ($event.target as HTMLInputElement).value"
              />
            </div>
            <button
              v-if="draft.headerColor"
              type="button"
              :class="$style.clearColor"
              @click="draft.headerColor = ''"
            >
              Clear
            </button>
          </div>
        </section>

        <!-- Page margins -->
        <section :class="$style.section">
          <AppSectionHeading>PDF Page Margins (pt)</AppSectionHeading>
          <p :class="$style.hint">1 point ≈ 0.35 mm. Default margins are 40 pt ≈ 14 mm.</p>
          <div :class="$style.marginsGrid">
            <div />
            <FormNumber v-model="draft.marginTop" label="Top" :min="0" :max="150" />
            <div />
            <FormNumber v-model="draft.marginLeft" label="Left" :min="0" :max="150" />
            <div :class="$style.marginCenter">A4</div>
            <FormNumber v-model="draft.marginRight" label="Right" :min="0" :max="150" />
            <div />
            <FormNumber v-model="draft.marginBottom" label="Bottom" :min="0" :max="150" />
            <div />
          </div>
        </section>
      </template>
    </ClientOnly>

    <!-- Reset confirmation modal -->
    <Teleport to="body">
      <Transition name="inv-reset-fade">
        <div
          v-if="showResetModal"
          :class="$style.modalBackdrop"
          role="presentation"
          @click.self="showResetModal = false"
          @keydown="onModalKeydown"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            aria-describedby="reset-modal-desc"
            :class="$style.modal"
          >
            <div :class="$style.modalIcon">
              <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
            </div>
            <h2 id="reset-modal-title" :class="$style.modalTitle">Reset to defaults?</h2>
            <p id="reset-modal-desc" :class="$style.modalDesc">
              All fields will be replaced with their default values. Nothing is
              saved until you click <strong>Save</strong>, so you can still back out.
            </p>
            <div :class="$style.modalActions">
              <button
                type="button"
                :class="$style.modalCancel"
                @click="showResetModal = false"
              >
                Cancel
              </button>
              <button
                ref="resetConfirmRef"
                type="button"
                :class="$style.modalConfirm"
                @click="confirmReset"
              >
                <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
                Reset fields
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style module lang="scss">
.page {
  padding: 2rem 2.5rem;
  max-width: 640px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

// ── Status pill ──────────────────────────────────────────────────────────────
.statusPill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  margin-right: 0.15rem;
}

.statusDirty {
  color: #b45309;
  background-color: color-mix(in srgb, #f59e0b 14%, transparent);
}

.statusSaved {
  color: #16a34a;
  background-color: color-mix(in srgb, #22c55e 12%, transparent);
}

.resetBtn {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 20%, transparent);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

// ── Save button ──────────────────────────────────────────────────────────────
.saveBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.saveBtnActive {
  border-color: color-mix(in srgb, var(--foreground-color) 35%, transparent);
  color: var(--foreground-color);

  &:hover:not(:disabled) {
    border-color: var(--foreground-color);
    background-color: color-mix(in srgb, var(--foreground-color) 6%, transparent);
  }
}

.intro {
  font-size: 0.82rem;
  line-height: 1.55;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  margin: 0 0 2rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.hint {
  font-size: 0.78rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0;
}

// Header color picker row
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

.clearColor {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 60%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

// 3×3 compass layout for margins
.marginsGrid {
  display: grid;
  grid-template-columns: 1fr 120px 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.5rem;
  align-items: center;
  max-width: 380px;
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

// ── Reset modal ───────────────────────────────────────────────────────────────
.modalBackdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in srgb, #000 48%, transparent);
  backdrop-filter: blur(3px);
}

.modal {
  background-color: var(--background-color);
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  border-radius: 14px;
  padding: 2rem;
  width: min(420px, calc(100vw - 2rem));
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.modalIcon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background-color: color-mix(in srgb, #f59e0b 16%, transparent);
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  margin-bottom: 0.25rem;
}

.modalTitle {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--foreground-color);
}

.modalDesc {
  font-size: 0.85rem;
  line-height: 1.55;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  margin: 0 0 0.5rem;
}

.modalActions {
  display: flex;
  gap: 0.6rem;
  width: 100%;
}

.modalCancel {
  flex: 1;
  padding: 0.55rem 1rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 8px;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  color: color-mix(in srgb, var(--foreground-color) 70%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:hover { border-color: color-mix(in srgb, var(--foreground-color) 40%, transparent); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.modalConfirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #b45309;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.88; }
  &:focus-visible { outline: 2px solid #b45309; outline-offset: 2px; }
}

// Fade transition for the backdrop
:global(.inv-reset-fade-enter-active),
:global(.inv-reset-fade-leave-active) {
  transition: opacity 0.18s ease;

  @media (prefers-reduced-motion: reduce) { transition: none; }
}

:global(.inv-reset-fade-enter-from),
:global(.inv-reset-fade-leave-to) {
  opacity: 0;
}
</style>
