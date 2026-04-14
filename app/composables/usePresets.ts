import type { Party, PaymentDetails, Presets } from "~/types/invoice";

const STORAGE_KEY = "inv:presets";

const EMPTY_PRESETS: Presets = {
  businesses: [],
  clients: [],
  paymentMethods: [],
  logos: [],
  notes: [],
};

function lsLoad(): Presets {
  if (import.meta.server) return structuredClone(EMPTY_PRESETS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Presets) : structuredClone(EMPTY_PRESETS);
  } catch {
    return structuredClone(EMPTY_PRESETS);
  }
}

function lsSave(data: Presets) {
  if (import.meta.server) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function usePresets() {
  const { loggedIn } = useUserSession();
  const presets = ref<Presets>(structuredClone(EMPTY_PRESETS));

  // ── Load ──────────────────────────────────────────────────────────────────

  onMounted(async () => {
    if (loggedIn.value) {
      try {
        const remote = await $fetch<Presets | null>("/api/presets");
        if (remote) {
          presets.value = remote;
          lsSave(remote); // keep localStorage in sync as a local cache
          return;
        }
      } catch {
        // fall through to localStorage
      }
    }
    presets.value = lsLoad();
  });

  // ── Auto-save (debounced) ─────────────────────────────────────────────────

  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    presets,
    (val) => {
      lsSave(val); // always write to localStorage immediately (fast, free)
      if (!loggedIn.value) return;

      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          await $fetch("/api/presets", {
            method: "PUT",
            body: { data: val },
          });
        } catch {
          // non-fatal — localStorage already has the latest
        }
      }, 600);
    },
    { deep: true },
  );

  // ── Businesses ──────────────────────────────────────────────────────────────

  function saveBusinessPreset(party: Party, label: string) {
    presets.value.businesses = [
      ...presets.value.businesses,
      { ...party, id: generateUUID(), label },
    ];
  }
  function updateBusinessPreset(id: string, party: Party, label: string) {
    presets.value.businesses = presets.value.businesses.map((p) =>
      p.id === id ? { ...party, id, label } : p,
    );
  }
  function deleteBusinessPreset(id: string) {
    presets.value.businesses = presets.value.businesses.filter((p) => p.id !== id);
  }

  // ── Clients ─────────────────────────────────────────────────────────────────

  function saveClientPreset(party: Party, label: string) {
    presets.value.clients = [
      ...presets.value.clients,
      { ...party, id: generateUUID(), label },
    ];
  }
  function updateClientPreset(id: string, party: Party, label: string) {
    presets.value.clients = presets.value.clients.map((p) =>
      p.id === id ? { ...party, id, label } : p,
    );
  }
  function deleteClientPreset(id: string) {
    presets.value.clients = presets.value.clients.filter((p) => p.id !== id);
  }

  // ── Payment methods ─────────────────────────────────────────────────────────

  function savePaymentPreset(payment: PaymentDetails, label: string) {
    presets.value.paymentMethods = [
      ...presets.value.paymentMethods,
      { ...payment, id: generateUUID(), label },
    ];
  }
  function updatePaymentPreset(id: string, payment: PaymentDetails, label: string) {
    presets.value.paymentMethods = presets.value.paymentMethods.map((p) =>
      p.id === id ? { ...payment, id, label } : p,
    );
  }
  function deletePaymentPreset(id: string) {
    presets.value.paymentMethods = presets.value.paymentMethods.filter((p) => p.id !== id);
  }

  // ── Notes ────────────────────────────────────────────────────────────────────

  function saveNotePreset(html: string, label: string) {
    presets.value.notes = [
      ...presets.value.notes,
      { id: generateUUID(), label, html },
    ];
  }
  function updateNotePreset(id: string, html: string, label: string) {
    presets.value.notes = presets.value.notes.map((n) =>
      n.id === id ? { id, label, html } : n,
    );
  }
  function deleteNotePreset(id: string) {
    presets.value.notes = presets.value.notes.filter((n) => n.id !== id);
  }

  return {
    presets,
    saveBusinessPreset,
    updateBusinessPreset,
    deleteBusinessPreset,
    saveClientPreset,
    updateClientPreset,
    deleteClientPreset,
    savePaymentPreset,
    updatePaymentPreset,
    deletePaymentPreset,
    saveNotePreset,
    updateNotePreset,
    deleteNotePreset,
  };
}
