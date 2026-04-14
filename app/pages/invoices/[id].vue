<script setup lang="ts">
import InvoiceBuilder from "~/components/InvoiceBuilder/InvoiceBuilder.vue";
import InvoicePreview from "~/components/Invoice/InvoicePreview.vue";

definePageMeta({ layout: "invoice" });

const route = useRoute();
const id = route.params.id as string;

const { invoice, isDraft, saving, saved, saveNow, discardDraft } = useInvoice(id);

// ── Discard confirmation modal ────────────────────────────────────────────────
const showDiscardModal = ref(false);
const discardConfirmRef = ref<HTMLButtonElement | null>(null);

watch(showDiscardModal, (open) => {
  if (open) nextTick(() => discardConfirmRef.value?.focus());
});

function confirmDiscard() {
  showDiscardModal.value = false;
  discardDraft();
}

function onModalKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") showDiscardModal.value = false;
}
const { generatePdf, generating } = useInvoicePdf();

// ── Zoom ─────────────────────────────────────────────────────────────────────
// autoZoom: derived from the preview panel width so the paper always fills it.
// manualZoom: user's ±0.1 multiplier on top of auto (1.0 = auto-fit).
// totalZoom passed to InvoicePreview and applied as CSS `zoom` (scales layout).
const PAPER_W = 680; // natural paper width in px (must match InvoicePreview)
const previewPanelRef = ref<HTMLElement | null>(null);
const autoZoom = ref(1);
const manualZoom = ref(1);
const totalZoom = computed(() => +(autoZoom.value * manualZoom.value).toFixed(3));

let ro: ResizeObserver | null = null;
onMounted(() => {
  ro = new ResizeObserver(([entry]) => {
    // 48px = 2 × 1.5rem horizontal padding inside the viewport
    autoZoom.value = Math.max(0.2, (entry.contentRect.width - 48) / PAPER_W);
  });
  if (previewPanelRef.value) ro.observe(previewPanelRef.value);
});
onUnmounted(() => ro?.disconnect());

function zoomIn() {
  manualZoom.value = Math.min(2, +(manualZoom.value + 0.1).toFixed(2));
}
function zoomOut() {
  manualZoom.value = Math.max(0.3, +(manualZoom.value - 0.1).toFixed(2));
}
function resetZoom() {
  manualZoom.value = 1;
}

// ── Resizable panel ──────────────────────────────────────────────────────────
const STORAGE_KEY = "inv:panel-width";
const MIN_W = 280;
const MAX_W = () => Math.round(window.innerWidth * 0.65);
const DEFAULT_W = () => Math.round(window.innerWidth * 0.45);

const panelWidth = ref<number | null>(null); // null = not hydrated yet (use CSS 45%)
const dragging = ref(false);

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  panelWidth.value = stored ? parseInt(stored, 10) : DEFAULT_W();
});

function onHandlePointerDown(e: PointerEvent) {
  e.preventDefault();
  dragging.value = true;
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onHandlePointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  const w = Math.min(MAX_W(), Math.max(MIN_W, e.clientX - 64)); // 64 = sidebar width
  panelWidth.value = w;
}

function onHandlePointerUp() {
  if (!dragging.value) return;
  dragging.value = false;
  if (panelWidth.value !== null) {
    localStorage.setItem(STORAGE_KEY, String(panelWidth.value));
  }
}

useSeoMeta({ title: "Invoice Builder — Invoice Generator" });
</script>

<template>
  <div :class="[$style.root, dragging && $style.dragging]">
    <!-- LEFT: builder form panel (resizable) -->
    <aside
      :class="$style.formPanel"
      :style="panelWidth !== null ? { width: panelWidth + 'px' } : {}"
      aria-label="Invoice form"
    >
      <div :class="$style.formHeader">
        <NuxtLink to="/" :class="$style.back" aria-label="Back to invoices">
          <Icon name="ph:arrow-left" aria-hidden="true" />
          <span>Invoices</span>
        </NuxtLink>
        <div :class="$style.headerActions">
          <!-- Status pill -->
          <span v-if="saving" :class="[$style.statusPill, $style.statusSaving]">
            <Icon name="ph:circle-notch" aria-hidden="true" :class="$style.spin" />
            Saving…
          </span>
          <span v-else-if="saved" :class="[$style.statusPill, $style.statusSaved]">
            <Icon name="ph:check-circle" aria-hidden="true" />
            Saved
          </span>
          <span v-else-if="isDraft" :class="[$style.statusPill, $style.statusDraft]">
            <Icon name="ph:pencil-simple" aria-hidden="true" />
            Draft
          </span>

          <!-- Discard draft (only when there's a draft) -->
          <button
            v-if="isDraft && !saving"
            type="button"
            :class="$style.discardBtn"
            aria-label="Discard draft and revert to last saved version"
            @click="showDiscardModal = true"
          >
            <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
            Discard
          </button>

          <!-- Save -->
          <button
            type="button"
            :class="[$style.saveBtn, isDraft && $style.saveBtnActive]"
            :disabled="!invoice || saving || !isDraft"
            :aria-label="saving ? 'Saving…' : 'Save invoice'"
            @click="saveNow"
          >
            <Icon name="ph:floppy-disk" aria-hidden="true" />
            Save
          </button>

          <!-- Download PDF -->
          <button
            type="button"
            :class="$style.downloadBtn"
            :disabled="!invoice || generating"
            @click="invoice && generatePdf(invoice)"
          >
            <Icon
              :name="generating ? 'ph:circle-notch' : 'ph:download-simple'"
              aria-hidden="true"
              :class="[generating && $style.spin]"
            />
            {{ generating ? "Generating…" : "Download PDF" }}
          </button>
        </div>
      </div>

      <ClientOnly>
        <AppAnonymousWarning :class="$style.warning" />
        <InvoiceBuilder
          v-if="invoice"
          :model-value="invoice"
          @update:model-value="invoice = $event"
        />
        <div v-else :class="$style.loading" aria-busy="true">Loading…</div>
      </ClientOnly>
    </aside>

    <!-- Drag handle -->
    <div
      :class="[$style.handle, dragging && $style.handleActive]"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      @pointerdown="onHandlePointerDown"
      @pointermove="onHandlePointerMove"
      @pointerup="onHandlePointerUp"
      @pointercancel="onHandlePointerUp"
    />

    <!-- RIGHT: zoomable preview -->
    <div ref="previewPanelRef" :class="$style.previewPanel" aria-label="Invoice preview">
      <!-- Zoom controls -->
      <div :class="$style.zoomBar" role="toolbar" aria-label="Preview zoom">
        <button type="button" :class="$style.zoomBtn" aria-label="Zoom out" @click="zoomOut">
          <Icon name="ph:minus" aria-hidden="true" />
        </button>
        <button type="button" :class="$style.zoomReset" aria-label="Reset zoom" @click="resetZoom">
          {{ Math.round(manualZoom * 100) }}%
        </button>
        <button type="button" :class="$style.zoomBtn" aria-label="Zoom in" @click="zoomIn">
          <Icon name="ph:plus" aria-hidden="true" />
        </button>
      </div>

      <ClientOnly>
        <InvoicePreview
          v-if="invoice"
          :invoice="invoice"
          :zoom="totalZoom"
          :class="$style.preview"
        />
      </ClientOnly>
    </div>
    <!-- Discard draft confirmation modal -->
    <Teleport to="body">
    <Transition name="inv-discard-fade">
      <div
        v-if="showDiscardModal"
        :class="$style.modalBackdrop"
        role="presentation"
        @click.self="showDiscardModal = false"
        @keydown="onModalKeydown"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
          aria-describedby="discard-modal-desc"
          :class="$style.modal"
        >
          <div :class="$style.modalIcon">
            <Icon name="ph:arrow-counter-clockwise" aria-hidden="true" />
          </div>
          <h2 id="discard-modal-title" :class="$style.modalTitle">Discard draft?</h2>
          <p id="discard-modal-desc" :class="$style.modalDesc">
            All unsaved changes will be permanently deleted. The invoice will revert
            to the last saved version.
          </p>
          <div :class="$style.modalActions">
            <button
              type="button"
              :class="$style.modalCancel"
              @click="showDiscardModal = false"
            >
              Keep editing
            </button>
            <button
              ref="discardConfirmRef"
              type="button"
              :class="$style.modalConfirm"
              @click="confirmDiscard"
            >
              <Icon name="ph:trash" aria-hidden="true" />
              Discard draft
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</div>
</template>

<style module lang="scss">
@use "msccss/scss/utils/variables" as v;

.root {
  display: flex;
  height: 100dvh;
  overflow: hidden;
}

// Prevent text selection while dragging
.dragging {
  user-select: none;
  cursor: col-resize;
}

// Form panel: resizable, scrollable
.formPanel {
  width: 45%; // fallback before JS hydrates
  min-width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--background-color);

  @media (max-width: #{v.$breakpoint-md - 1}) {
    width: 100% !important;
    max-width: none;
  }
}

// Drag handle — sits between the two panels
.handle {
  width: 5px;
  flex-shrink: 0;
  cursor: col-resize;
  background-color: color-mix(in srgb, var(--foreground-color) 12%, transparent);
  transition: background-color 0.15s ease;
  position: relative;

  // Widen the hit area without affecting layout
  &::after {
    content: "";
    position: absolute;
    inset: 0 -4px;
  }

  &:hover,
  &:focus-visible {
    background-color: color-mix(in srgb, var(--foreground-color) 28%, transparent);
  }

  &:focus-visible {
    outline: none;
  }
}

.handleActive {
  background-color: #ffe44d;
}

.formHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
  gap: 0.5rem;
  flex-shrink: 0;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  transition: color 0.15s ease;

  &:hover { color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
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

.statusSaving {
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  background-color: color-mix(in srgb, var(--foreground-color) 7%, transparent);
}

.statusSaved {
  color: #16a34a;
  background-color: color-mix(in srgb, #22c55e 12%, transparent);
}

.statusDraft {
  color: #b45309;
  background-color: color-mix(in srgb, #f59e0b 14%, transparent);
}

// ── Discard button ───────────────────────────────────────────────────────────
.discardBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 8px;
  padding: 0.42rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background-color: color-mix(in srgb, #ef4444 8%, transparent);
  }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

// ── Save button ──────────────────────────────────────────────────────────────
.saveBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 8px;
  padding: 0.42rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  color: color-mix(in srgb, var(--foreground-color) 45%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:disabled { opacity: 0.35; cursor: not-allowed; }
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

.downloadBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #ffe44d;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #1a1a1a; outline-offset: 2px; }
}

.spin {
  animation: spin 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) { animation: none; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.warning {
  margin: 0.75rem 1.5rem 0;
}

.loading {
  padding: 2rem;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
  font-size: 0.85rem;
}

// Preview panel: rest of space
.previewPanel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: #{v.$breakpoint-md - 1}) {
    display: none;
  }
}

.zoomBar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--foreground-color) 10%, transparent);
  background-color: var(--background-color);
  flex-shrink: 0;
}

.zoomBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--foreground-color);
  transition: background-color 0.12s ease;

  &:hover { background-color: color-mix(in srgb, var(--foreground-color) 8%, transparent); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.zoomReset {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  color: color-mix(in srgb, var(--foreground-color) 70%, transparent);
  min-width: 44px;
  text-align: center;
  transition: background-color 0.12s ease;

  &:hover { background-color: color-mix(in srgb, var(--foreground-color) 8%, transparent); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.preview {
  flex: 1;
  overflow-y: auto;
}

// ── Discard modal ─────────────────────────────────────────────────────────────
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
  background-color: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
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
  background-color: #ef4444;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.88; }
  &:focus-visible { outline: 2px solid #ef4444; outline-offset: 2px; }
}

// Fade transition for the backdrop
:global(.inv-discard-fade-enter-active),
:global(.inv-discard-fade-leave-active) {
  transition: opacity 0.18s ease;

  @media (prefers-reduced-motion: reduce) { transition: none; }
}

:global(.inv-discard-fade-enter-from),
:global(.inv-discard-fade-leave-to) {
  opacity: 0;
}
</style>
