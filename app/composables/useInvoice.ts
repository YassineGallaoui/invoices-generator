import type { Invoice } from "~/types/invoice";

/**
 * Reactive wrapper for a single invoice.
 *
 * Save model:
 *  - Edits are auto-saved to a draft (DB when logged in, localStorage when
 *    anonymous) at 300 ms debounce. Zero extra DB writes happen automatically.
 *  - saveNow()      → flushes invoice to DB/localStorage as the saved version
 *                     (draft is cleared atomically by the store).
 *  - discardDraft() → restores the last explicitly saved snapshot, clears draft.
 *
 * Status surface: { isDraft, saving, saved }
 *  - isDraft  true while there are unsaved local edits
 *  - saving   true during the DB write in saveNow()
 *  - saved    true for 2.5 s after a successful saveNow()
 */
export function useInvoice(id: string) {
  const store = useInvoiceStore();
  const invoice = ref<Invoice | null>(null);
  const lastSaved = ref<Invoice | null>(null);
  const isDraft = ref(false);
  const saving = ref(false);
  const saved = ref(false);

  // ── Mount: load saved + draft in one call ─────────────────────────────────
  let initialized = false;

  onMounted(async () => {
    const { saved: savedVersion, draft } = await store.load(id);

    if (savedVersion) {
      lastSaved.value = savedVersion;
    } else {
      // Brand-new invoice — pass the id so create() saves exactly once
      const fresh = await store.create(id);
      lastSaved.value = fresh;
    }

    if (draft) {
      invoice.value = draft;
      isDraft.value = true;
    } else {
      invoice.value = JSON.parse(JSON.stringify(lastSaved.value));
      isDraft.value = false;
    }

    // Wait for Vue to flush the watcher triggered by setting invoice.value above.
    // Without this, the watch fires *after* initialized=true and falsely marks
    // a freshly-loaded invoice (with no real edits) as a draft.
    await nextTick();
    initialized = true;
  });

  // ── Watch: auto-save draft to store (no full save) ───────────────────────
  let discarding = false;
  let draftTimer: ReturnType<typeof setTimeout> | null = null;
  let savedTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    invoice,
    (inv) => {
      if (!initialized || !inv) return;

      if (discarding) {
        discarding = false;
        isDraft.value = false;
        return;
      }

      isDraft.value = true;
      saved.value = false;

      if (draftTimer) clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        store.saveDraft(inv);
      }, 300);
    },
    { deep: true },
  );

  // ── saveNow: explicit save → clears draft atomically via store ────────────
  async function saveNow() {
    if (!invoice.value) return;
    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
    }

    saving.value = true;
    await store.save(invoice.value); // also clears draft in DB/localStorage
    lastSaved.value = JSON.parse(JSON.stringify(invoice.value));
    isDraft.value = false;
    saving.value = false;
    saved.value = true;

    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      saved.value = false;
    }, 2500);
  }

  // ── discardDraft: revert to last saved, clear draft from store ────────────
  function discardDraft() {
    if (!lastSaved.value) return;
    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
    }
    store.clearDraft(id);
    discarding = true;
    invoice.value = JSON.parse(JSON.stringify(lastSaved.value));
  }

  return { invoice, isDraft, saving, saved, saveNow, discardDraft };
}
