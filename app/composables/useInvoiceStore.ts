import type { Invoice, InvoiceListEntry, ItemsSection } from "~/types/invoice";

/**
 * Forward-migrates a raw stored invoice to the current schema.
 * Safe to run on already-migrated invoices (idempotent).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw JSON from localStorage
function migrateInvoice(raw: any): Invoice {
  // ── items: LineItem[] → ItemsSection[] ─────────────────────────────────────
  if (Array.isArray(raw.items) && raw.items.length > 0 && "description" in raw.items[0]) {
    const oldItems = raw.items as Array<{
      id: string; description: string; unitPrice: number; quantity: number; unit?: string;
    }>;
    const sharedUnit = oldItems[0]?.unit ?? "";
    raw.items = [
      {
        id: generateUUID(),
        unit: sharedUnit,
        items: oldItems.map(({ unit: _u, ...rest }) => rest),
      } satisfies ItemsSection,
    ];
  }

  // ── Party.cf field ──────────────────────────────────────────────────────────
  if (raw.from && !("cf" in raw.from)) raw.from.cf = "";
  if (raw.to && !("cf" in raw.to)) raw.to.cf = "";

  // ── Party.address → address1 + address2 ────────────────────────────────────
  if (raw.from && "address" in raw.from) { raw.from.address1 = raw.from.address ?? ""; raw.from.address2 = ""; delete raw.from.address; }
  if (raw.to   && "address" in raw.to)   { raw.to.address1   = raw.to.address   ?? ""; raw.to.address2   = ""; delete raw.to.address;   }
  if (raw.from && !("address1" in raw.from)) { raw.from.address1 = ""; raw.from.address2 = ""; }
  if (raw.to   && !("address1" in raw.to))   { raw.to.address1   = ""; raw.to.address2   = ""; }

  // ── InvoiceConfig.headerColor ───────────────────────────────────────────────
  if (raw.config && !("headerColor" in raw.config)) raw.config.headerColor = "";

  return raw as Invoice;
}

// ── localStorage helpers ────────────────────────────────────────────────────

const INDEX_KEY = "inv:index";
const invoiceKey = (id: string) => `inv:data:${id}`;
const draftKey   = (id: string) => `inv:draft:${id}`;

function lsLoadIndex(): InvoiceListEntry[] {
  if (import.meta.server) return [];
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as InvoiceListEntry[]; } catch { return []; }
}

function lsSaveIndex(entries: InvoiceListEntry[]) {
  if (import.meta.server) return;
  localStorage.setItem(INDEX_KEY, JSON.stringify(entries));
}

function lsLoad(id: string): Invoice | null {
  if (import.meta.server) return null;
  const raw = localStorage.getItem(invoiceKey(id));
  if (!raw) return null;
  try { return migrateInvoice(JSON.parse(raw)); } catch { return null; }
}

function lsSave(invoice: Invoice) {
  if (import.meta.server) return;
  localStorage.setItem(invoiceKey(invoice.id), JSON.stringify(invoice));
  const index = lsLoadIndex();
  const entry: InvoiceListEntry = {
    id: invoice.id,
    label: deriveLabel(invoice),
    invoiceNumber: invoice.preheader.invoiceNumber,
    updatedAt: invoice.updatedAt,
  };
  const existing = index.findIndex((e) => e.id === invoice.id);
  if (existing >= 0) { index[existing] = entry; } else { index.unshift(entry); }
  lsSaveIndex(index);
}

function lsRemove(id: string) {
  if (import.meta.server) return;
  localStorage.removeItem(invoiceKey(id));
  localStorage.removeItem(draftKey(id));
  lsSaveIndex(lsLoadIndex().filter((e) => e.id !== id));
}

function lsLoadDraft(id: string): Invoice | null {
  if (import.meta.server) return null;
  const raw = localStorage.getItem(draftKey(id));
  if (!raw) return null;
  try { return migrateInvoice(JSON.parse(raw)); } catch { return null; }
}

function lsSaveDraft(invoice: Invoice) {
  if (import.meta.server) return;
  localStorage.setItem(draftKey(invoice.id), JSON.stringify(invoice));
}

function lsClearDraft(id: string) {
  if (import.meta.server) return;
  localStorage.removeItem(draftKey(id));
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function deriveLabel(invoice: Invoice): string {
  if (invoice.preheader.kind === "text" && invoice.preheader.text) {
    return invoice.preheader.text;
  }
  return "Invoice";
}

function createDefaultInvoice(id: string): Invoice {
  const now = new Date().toISOString();
  const today = now.split("T")[0]!;
  return {
    id,
    createdAt: now,
    updatedAt: now,
    // New invoices inherit the user's saved settings (Settings page);
    // each invoice keeps its own editable copy from here on.
    config: loadGlobalInvoiceConfig(),
    preheader: {
      kind: "text",
      text: "Invoice",
      logoDataUrl: "",
      invoiceNumber: "",
      invoiceDate: today,
    },
    from: { id: "", label: "", name: "", address1: "", address2: "", vatNumber: "", cf: "", email: "", phone: "", extra: [] },
    to:   { id: "", label: "", name: "", address1: "", address2: "", vatNumber: "", cf: "", email: "", phone: "", extra: [] },
    items: [
      {
        id: generateUUID(),
        unit: "",
        items: [{ id: generateUUID(), description: "", unitPrice: 0, quantity: 1 }],
      } satisfies ItemsSection,
    ],
    payment: { id: "", label: "", iban: "", bicSwift: "", extra: "" },
    notesHtml: "",
  };
}

// ── Composable ──────────────────────────────────────────────────────────────

export function useInvoiceStore() {
  const { loggedIn } = useUserSession();

  // ── List ──────────────────────────────────────────────────────────────────

  async function loadIndex(): Promise<InvoiceListEntry[]> {
    if (loggedIn.value) {
      return await $fetch<InvoiceListEntry[]>("/api/invoices");
    }
    return lsLoadIndex();
  }

  // ── Single load ───────────────────────────────────────────────────────────

  async function load(id: string): Promise<{ saved: Invoice | null; draft: Invoice | null }> {
    if (loggedIn.value) {
      try {
        const res = await $fetch<{ data: Invoice; draftData: Invoice | null }>(`/api/invoices/${id}`);
        return {
          saved: migrateInvoice(res.data),
          draft: res.draftData ? migrateInvoice(res.draftData) : null,
        };
      } catch {
        return { saved: null, draft: null };
      }
    }
    return { saved: lsLoad(id), draft: lsLoadDraft(id) };
  }

  // ── Save (upsert, clears draft atomically) ────────────────────────────────

  async function save(invoice: Invoice) {
    invoice.updatedAt = new Date().toISOString();
    if (loggedIn.value) {
      await $fetch("/api/invoices", {
        method: "POST",
        body: { id: invoice.id, data: invoice },
      });
    } else {
      lsSave(invoice);
      lsClearDraft(invoice.id);
    }
  }

  // ── Draft ─────────────────────────────────────────────────────────────────

  async function saveDraft(invoice: Invoice) {
    if (loggedIn.value) {
      await $fetch(`/api/invoices/${invoice.id}/draft`, {
        method: "PUT",
        body: { draft: invoice },
      });
    } else {
      lsSaveDraft(invoice);
    }
  }

  async function clearDraft(id: string) {
    if (loggedIn.value) {
      await $fetch(`/api/invoices/${id}/draft`, { method: "DELETE" });
    } else {
      lsClearDraft(id);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function remove(id: string) {
    if (loggedIn.value) {
      await $fetch(`/api/invoices/${id}`, { method: "DELETE" });
    } else {
      lsRemove(id);
    }
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async function create(id?: string): Promise<Invoice> {
    const invoice = createDefaultInvoice(id ?? generateUUID());
    await save(invoice);
    return invoice;
  }

  // ── localStorage helpers (still exposed for account stats) ────────────────

  function loadIndexSync(): InvoiceListEntry[] {
    return lsLoadIndex();
  }

  return { loadIndex, load, save, saveDraft, clearDraft, remove, create, loadIndexSync };
}
