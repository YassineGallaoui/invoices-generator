<script setup lang="ts">
import type { Party, PaymentDetails } from "~/types/invoice";

useSeoMeta({ title: "Presets — Invoice Generator" });

const {
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
} = usePresets();

type Tab = "businesses" | "clients" | "payments" | "notes";
const activeTab = ref<Tab>("businesses");

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "businesses", label: "My Businesses", icon: "ph:buildings" },
  { key: "clients", label: "Clients", icon: "ph:users" },
  { key: "payments", label: "Payment Methods", icon: "ph:bank" },
  { key: "notes", label: "Notes", icon: "ph:note" },
];

// ── Empty factories ───────────────────────────────────────────────────────────
const emptyParty = (): Party => ({
  id: "", label: "", name: "", address1: "", address2: "",
  vatNumber: "", cf: "", email: "", phone: "", extra: [],
});
const emptyPayment = (): PaymentDetails => ({
  id: "", label: "", iban: "", bicSwift: "", extra: "",
});

// ── Add state ─────────────────────────────────────────────────────────────────
const showAddBusiness = ref(false);
const newBusiness = ref<Party & { presetLabel: string }>({ ...emptyParty(), presetLabel: "" });

const showAddClient = ref(false);
const newClient = ref<Party & { presetLabel: string }>({ ...emptyParty(), presetLabel: "" });

const showAddPayment = ref(false);
const newPayment = ref<PaymentDetails & { presetLabel: string }>({ ...emptyPayment(), presetLabel: "" });

const showAddNote = ref(false);
const newNote = ref({ presetLabel: "", html: "" });

// ── Edit state ────────────────────────────────────────────────────────────────
const editingBusinessId = ref<string | null>(null);
const editBusiness = ref<Party & { presetLabel: string }>({ ...emptyParty(), presetLabel: "" });

const editingClientId = ref<string | null>(null);
const editClient = ref<Party & { presetLabel: string }>({ ...emptyParty(), presetLabel: "" });

const editingPaymentId = ref<string | null>(null);
const editPayment = ref<PaymentDetails & { presetLabel: string }>({ ...emptyPayment(), presetLabel: "" });

const editingNoteId = ref<string | null>(null);
const editNote = ref({ presetLabel: "", html: "" });

function startEditBusiness(b: Party) {
  showAddBusiness.value = false;
  editingBusinessId.value = b.id;
  editBusiness.value = { ...b, presetLabel: b.label };
}
function startEditClient(c: Party) {
  showAddClient.value = false;
  editingClientId.value = c.id;
  editClient.value = { ...c, presetLabel: c.label };
}
function startEditPayment(pm: PaymentDetails) {
  showAddPayment.value = false;
  editingPaymentId.value = pm.id;
  editPayment.value = { ...pm, presetLabel: pm.label };
}
function startEditNote(n: { id: string; label: string; html: string }) {
  showAddNote.value = false;
  editingNoteId.value = n.id;
  editNote.value = { presetLabel: n.label, html: n.html };
}

// ── Add handlers ──────────────────────────────────────────────────────────────
function addBusiness() {
  if (!newBusiness.value.presetLabel.trim()) return;
  const { presetLabel, ...party } = newBusiness.value;
  saveBusinessPreset(party, presetLabel.trim());
  showAddBusiness.value = false;
  newBusiness.value = { ...emptyParty(), presetLabel: "" };
}
function addClient() {
  if (!newClient.value.presetLabel.trim()) return;
  const { presetLabel, ...party } = newClient.value;
  saveClientPreset(party, presetLabel.trim());
  showAddClient.value = false;
  newClient.value = { ...emptyParty(), presetLabel: "" };
}
function addPayment() {
  if (!newPayment.value.presetLabel.trim()) return;
  const { presetLabel, ...payment } = newPayment.value;
  savePaymentPreset(payment, presetLabel.trim());
  showAddPayment.value = false;
  newPayment.value = { ...emptyPayment(), presetLabel: "" };
}
function addNote() {
  if (!newNote.value.presetLabel.trim()) return;
  saveNotePreset(newNote.value.html, newNote.value.presetLabel.trim());
  showAddNote.value = false;
  newNote.value = { presetLabel: "", html: "" };
}

// ── Update handlers ───────────────────────────────────────────────────────────
function saveBusiness() {
  if (!editingBusinessId.value || !editBusiness.value.presetLabel.trim()) return;
  const { presetLabel, ...party } = editBusiness.value;
  updateBusinessPreset(editingBusinessId.value, party, presetLabel.trim());
  editingBusinessId.value = null;
}
function saveClient() {
  if (!editingClientId.value || !editClient.value.presetLabel.trim()) return;
  const { presetLabel, ...party } = editClient.value;
  updateClientPreset(editingClientId.value, party, presetLabel.trim());
  editingClientId.value = null;
}
function savePayment() {
  if (!editingPaymentId.value || !editPayment.value.presetLabel.trim()) return;
  const { presetLabel, ...payment } = editPayment.value;
  updatePaymentPreset(editingPaymentId.value, payment, presetLabel.trim());
  editingPaymentId.value = null;
}
function saveNote() {
  if (!editingNoteId.value || !editNote.value.presetLabel.trim()) return;
  updateNotePreset(editingNoteId.value, editNote.value.html, editNote.value.presetLabel.trim());
  editingNoteId.value = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.header">
      <h1 :class="$style.title">Presets</h1>
      <p :class="$style.sub">
        Save reusable data to fill invoices instantly. Presets are available in the invoice builder via the "Load preset" selector in each section.
      </p>
    </header>

    <ClientOnly>
      <!-- Tabs -->
      <div :class="$style.tabs" role="tablist" aria-label="Preset categories">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.key"
          :class="[$style.tab, activeTab === tab.key && $style.tabActive]"
          @click="activeTab = tab.key"
        >
          <Icon :name="tab.icon" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ── BUSINESSES ───────────────────────────────────────────────────── -->
      <section v-if="activeTab === 'businesses'" :class="$style.panel">
        <div :class="$style.panelHeader">
          <p :class="$style.panelHint">Your own business / freelance profiles. Loaded into the FROM column.</p>
          <button type="button" :class="$style.addBtn" @click="showAddBusiness = !showAddBusiness; editingBusinessId = null">
            <Icon name="ph:plus" aria-hidden="true" />
            Add business
          </button>
        </div>

        <div v-if="showAddBusiness" :class="$style.form">
          <p :class="$style.formTitle">New business preset</p>
          <div :class="$style.formGrid">
            <FormInput v-model="newBusiness.presetLabel" label="Preset name *" placeholder="e.g. My Studio" />
            <FormInput v-model="newBusiness.name" label="Company / Name" />
            <FormInput v-model="newBusiness.address1" label="Address line 1" />
            <FormInput v-model="newBusiness.address2" label="Address line 2" />
            <FormInput v-model="newBusiness.vatNumber" label="VAT Number" />
            <FormInput v-model="newBusiness.cf" label="Codice Fiscale" />
            <FormInput v-model="newBusiness.email" label="Email" type="email" />
            <FormInput v-model="newBusiness.phone" label="Phone" type="tel" />
          </div>
          <div :class="$style.formActions">
            <button type="button" :class="$style.saveBtn" :disabled="!newBusiness.presetLabel.trim()" @click="addBusiness">Save</button>
            <button type="button" :class="$style.cancelBtn" @click="showAddBusiness = false">Cancel</button>
          </div>
        </div>

        <ul v-if="presets.businesses.length > 0" :class="$style.list" role="list">
          <li v-for="b in presets.businesses" :key="b.id" :class="$style.item">
            <!-- Edit form -->
            <div v-if="editingBusinessId === b.id" :class="$style.form">
              <p :class="$style.formTitle">Edit "{{ b.label }}"</p>
              <div :class="$style.formGrid">
                <FormInput v-model="editBusiness.presetLabel" label="Preset name *" />
                <FormInput v-model="editBusiness.name" label="Company / Name" />
                <FormInput v-model="editBusiness.address1" label="Address line 1" />
                <FormInput v-model="editBusiness.address2" label="Address line 2" />
                <FormInput v-model="editBusiness.vatNumber" label="VAT Number" />
                <FormInput v-model="editBusiness.cf" label="Codice Fiscale" />
                <FormInput v-model="editBusiness.email" label="Email" type="email" />
                <FormInput v-model="editBusiness.phone" label="Phone" type="tel" />
              </div>
              <div :class="$style.formActions">
                <button type="button" :class="$style.saveBtn" :disabled="!editBusiness.presetLabel.trim()" @click="saveBusiness">Save changes</button>
                <button type="button" :class="$style.cancelBtn" @click="editingBusinessId = null">Cancel</button>
              </div>
            </div>
            <!-- Card row -->
            <template v-else>
              <div :class="$style.cardBody">
                <span :class="$style.cardLabel">{{ b.label }}</span>
                <span v-if="b.name" :class="$style.cardName">{{ b.name }}</span>
                <span v-if="b.email || b.vatNumber" :class="$style.cardMeta">
                  {{ [b.email, b.vatNumber].filter(Boolean).join(" · ") }}
                </span>
              </div>
              <button type="button" :class="$style.editBtn" :aria-label="`Edit ${b.label}`" @click="startEditBusiness(b)">
                <Icon name="ph:pencil-simple" aria-hidden="true" />
              </button>
              <button type="button" :class="$style.deleteBtn" :aria-label="`Delete ${b.label}`" @click="deleteBusinessPreset(b.id)">
                <Icon name="ph:trash" aria-hidden="true" />
              </button>
            </template>
          </li>
        </ul>
        <p v-else-if="!showAddBusiness" :class="$style.empty">No business presets yet.</p>
      </section>

      <!-- ── CLIENTS ──────────────────────────────────────────────────────── -->
      <section v-if="activeTab === 'clients'" :class="$style.panel">
        <div :class="$style.panelHeader">
          <p :class="$style.panelHint">Client profiles. Loaded into the TO column.</p>
          <button type="button" :class="$style.addBtn" @click="showAddClient = !showAddClient; editingClientId = null">
            <Icon name="ph:plus" aria-hidden="true" />
            Add client
          </button>
        </div>

        <div v-if="showAddClient" :class="$style.form">
          <p :class="$style.formTitle">New client preset</p>
          <div :class="$style.formGrid">
            <FormInput v-model="newClient.presetLabel" label="Preset name *" placeholder="e.g. Acme Corp" />
            <FormInput v-model="newClient.name" label="Company / Name" />
            <FormInput v-model="newClient.address1" label="Address line 1" />
            <FormInput v-model="newClient.address2" label="Address line 2" />
            <FormInput v-model="newClient.vatNumber" label="VAT Number" />
            <FormInput v-model="newClient.cf" label="Codice Fiscale" />
            <FormInput v-model="newClient.email" label="Email" type="email" />
            <FormInput v-model="newClient.phone" label="Phone" type="tel" />
          </div>
          <div :class="$style.formActions">
            <button type="button" :class="$style.saveBtn" :disabled="!newClient.presetLabel.trim()" @click="addClient">Save</button>
            <button type="button" :class="$style.cancelBtn" @click="showAddClient = false">Cancel</button>
          </div>
        </div>

        <ul v-if="presets.clients.length > 0" :class="$style.list" role="list">
          <li v-for="c in presets.clients" :key="c.id" :class="$style.item">
            <div v-if="editingClientId === c.id" :class="$style.form">
              <p :class="$style.formTitle">Edit "{{ c.label }}"</p>
              <div :class="$style.formGrid">
                <FormInput v-model="editClient.presetLabel" label="Preset name *" />
                <FormInput v-model="editClient.name" label="Company / Name" />
                <FormInput v-model="editClient.address1" label="Address line 1" />
                <FormInput v-model="editClient.address2" label="Address line 2" />
                <FormInput v-model="editClient.vatNumber" label="VAT Number" />
                <FormInput v-model="editClient.cf" label="Codice Fiscale" />
                <FormInput v-model="editClient.email" label="Email" type="email" />
                <FormInput v-model="editClient.phone" label="Phone" type="tel" />
              </div>
              <div :class="$style.formActions">
                <button type="button" :class="$style.saveBtn" :disabled="!editClient.presetLabel.trim()" @click="saveClient">Save changes</button>
                <button type="button" :class="$style.cancelBtn" @click="editingClientId = null">Cancel</button>
              </div>
            </div>
            <template v-else>
              <div :class="$style.cardBody">
                <span :class="$style.cardLabel">{{ c.label }}</span>
                <span v-if="c.name" :class="$style.cardName">{{ c.name }}</span>
                <span v-if="c.email || c.vatNumber" :class="$style.cardMeta">
                  {{ [c.email, c.vatNumber].filter(Boolean).join(" · ") }}
                </span>
              </div>
              <button type="button" :class="$style.editBtn" :aria-label="`Edit ${c.label}`" @click="startEditClient(c)">
                <Icon name="ph:pencil-simple" aria-hidden="true" />
              </button>
              <button type="button" :class="$style.deleteBtn" :aria-label="`Delete ${c.label}`" @click="deleteClientPreset(c.id)">
                <Icon name="ph:trash" aria-hidden="true" />
              </button>
            </template>
          </li>
        </ul>
        <p v-else-if="!showAddClient" :class="$style.empty">No client presets yet.</p>
      </section>

      <!-- ── PAYMENT METHODS ──────────────────────────────────────────────── -->
      <section v-if="activeTab === 'payments'" :class="$style.panel">
        <div :class="$style.panelHeader">
          <p :class="$style.panelHint">Bank accounts and payment instructions. Loaded into the Payment Details column.</p>
          <button type="button" :class="$style.addBtn" @click="showAddPayment = !showAddPayment; editingPaymentId = null">
            <Icon name="ph:plus" aria-hidden="true" />
            Add payment method
          </button>
        </div>

        <div v-if="showAddPayment" :class="$style.form">
          <p :class="$style.formTitle">New payment method preset</p>
          <div :class="$style.formGrid">
            <FormInput v-model="newPayment.presetLabel" label="Preset name *" placeholder="e.g. Main account" />
            <FormInput v-model="newPayment.iban" label="IBAN" placeholder="DE89370400440532013000" />
            <FormInput v-model="newPayment.bicSwift" label="BIC / SWIFT" placeholder="COBADEFFXXX" />
            <FormInput v-model="newPayment.extra" label="Additional info" />
          </div>
          <div :class="$style.formActions">
            <button type="button" :class="$style.saveBtn" :disabled="!newPayment.presetLabel.trim()" @click="addPayment">Save</button>
            <button type="button" :class="$style.cancelBtn" @click="showAddPayment = false">Cancel</button>
          </div>
        </div>

        <ul v-if="presets.paymentMethods.length > 0" :class="$style.list" role="list">
          <li v-for="pm in presets.paymentMethods" :key="pm.id" :class="$style.item">
            <div v-if="editingPaymentId === pm.id" :class="$style.form">
              <p :class="$style.formTitle">Edit "{{ pm.label }}"</p>
              <div :class="$style.formGrid">
                <FormInput v-model="editPayment.presetLabel" label="Preset name *" />
                <FormInput v-model="editPayment.iban" label="IBAN" />
                <FormInput v-model="editPayment.bicSwift" label="BIC / SWIFT" />
                <FormInput v-model="editPayment.extra" label="Additional info" />
              </div>
              <div :class="$style.formActions">
                <button type="button" :class="$style.saveBtn" :disabled="!editPayment.presetLabel.trim()" @click="savePayment">Save changes</button>
                <button type="button" :class="$style.cancelBtn" @click="editingPaymentId = null">Cancel</button>
              </div>
            </div>
            <template v-else>
              <div :class="$style.cardBody">
                <span :class="$style.cardLabel">{{ pm.label }}</span>
                <span v-if="pm.iban" :class="$style.cardName">IBAN: {{ pm.iban }}</span>
                <span v-if="pm.bicSwift" :class="$style.cardMeta">BIC/SWIFT: {{ pm.bicSwift }}</span>
              </div>
              <button type="button" :class="$style.editBtn" :aria-label="`Edit ${pm.label}`" @click="startEditPayment(pm)">
                <Icon name="ph:pencil-simple" aria-hidden="true" />
              </button>
              <button type="button" :class="$style.deleteBtn" :aria-label="`Delete ${pm.label}`" @click="deletePaymentPreset(pm.id)">
                <Icon name="ph:trash" aria-hidden="true" />
              </button>
            </template>
          </li>
        </ul>
        <p v-else-if="!showAddPayment" :class="$style.empty">No payment method presets yet.</p>
      </section>

      <!-- ── NOTES ────────────────────────────────────────────────────────── -->
      <section v-if="activeTab === 'notes'" :class="$style.panel">
        <div :class="$style.panelHeader">
          <p :class="$style.panelHint">Reusable note templates (rich text). Loaded into the Notes column.</p>
          <button type="button" :class="$style.addBtn" @click="showAddNote = !showAddNote; editingNoteId = null">
            <Icon name="ph:plus" aria-hidden="true" />
            Add note
          </button>
        </div>

        <div v-if="showAddNote" :class="$style.form">
          <p :class="$style.formTitle">New note preset</p>
          <FormInput v-model="newNote.presetLabel" label="Preset name *" placeholder="e.g. Standard payment terms" />
          <FormRichText
            :model-value="newNote.html"
            label="Note content"
            placeholder="Payment due within 30 days…"
            @update:model-value="newNote.html = $event"
          />
          <div :class="$style.formActions">
            <button type="button" :class="$style.saveBtn" :disabled="!newNote.presetLabel.trim()" @click="addNote">Save</button>
            <button type="button" :class="$style.cancelBtn" @click="showAddNote = false">Cancel</button>
          </div>
        </div>

        <ul v-if="presets.notes.length > 0" :class="$style.list" role="list">
          <li v-for="n in presets.notes" :key="n.id" :class="$style.item">
            <div v-if="editingNoteId === n.id" :class="$style.form">
              <p :class="$style.formTitle">Edit "{{ n.label }}"</p>
              <FormInput v-model="editNote.presetLabel" label="Preset name *" />
              <FormRichText
                :model-value="editNote.html"
                label="Note content"
                @update:model-value="editNote.html = $event"
              />
              <div :class="$style.formActions">
                <button type="button" :class="$style.saveBtn" :disabled="!editNote.presetLabel.trim()" @click="saveNote">Save changes</button>
                <button type="button" :class="$style.cancelBtn" @click="editingNoteId = null">Cancel</button>
              </div>
            </div>
            <template v-else>
              <div :class="$style.cardBody">
                <span :class="$style.cardLabel">{{ n.label }}</span>
                <span v-if="n.html" :class="[$style.cardMeta, $style.notePreview]">{{ stripHtml(n.html) }}</span>
              </div>
              <button type="button" :class="$style.editBtn" :aria-label="`Edit ${n.label}`" @click="startEditNote(n)">
                <Icon name="ph:pencil-simple" aria-hidden="true" />
              </button>
              <button type="button" :class="$style.deleteBtn" :aria-label="`Delete ${n.label}`" @click="deleteNotePreset(n.id)">
                <Icon name="ph:trash" aria-hidden="true" />
              </button>
            </template>
          </li>
        </ul>
        <p v-else-if="!showAddNote" :class="$style.empty">No note presets yet.</p>
      </section>
    </ClientOnly>
  </div>
</template>

<style module lang="scss">
.page {
  padding: 2rem 2.5rem;
  max-width: 720px;
}

.header {
  margin-bottom: 1.75rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
  line-height: 1.2;
}

.sub {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0;
  line-height: 1.6;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  transition: color 0.15s ease, border-color 0.15s ease;
  border-radius: 4px 4px 0 0;

  &:hover { color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.tabActive {
  color: var(--foreground-color);
  border-bottom-color: #ffe44d;
}

// ── Panel ─────────────────────────────────────────────────────────────────────
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panelHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.panelHint {
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--foreground-color) 55%, transparent);
  margin: 0;
}

.addBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #ffe44d;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.85; }
  &:focus-visible { outline: 2px solid #1a1a1a; outline-offset: 2px; }
}

// ── Form (add & edit) ─────────────────────────────────────────────────────────
.form {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: color-mix(in srgb, var(--foreground-color) 3%, transparent);
}

.formTitle {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
  margin: 0;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.65rem;
}

.formActions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.saveBtn {
  background-color: #ffe44d;
  color: #1a1a1a;
  border: none;
  border-radius: 7px;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #1a1a1a; outline-offset: 2px; }
}

.cancelBtn {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
  border-radius: 7px;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  color: color-mix(in srgb, var(--foreground-color) 65%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover { border-color: var(--foreground-color); color: var(--foreground-color); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

// ── List ──────────────────────────────────────────────────────────────────────
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.item {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 10%, transparent);
  border-radius: 8px;
  background-color: color-mix(in srgb, var(--foreground-color) 3%, transparent);
  transition: border-color 0.15s ease;

  // card row mode
  &:has(.cardBody) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem 0.75rem 1rem;

    &:hover { border-color: color-mix(in srgb, var(--foreground-color) 22%, transparent); }
  }

  // edit form mode — let the .form inside breathe
  &:has(.form) {
    padding: 0;
    border-color: #ffe44d;
    background: transparent;
  }
}

.cardBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.cardLabel {
  font-weight: 700;
  font-size: 0.88rem;
}

.cardName {
  font-size: 0.82rem;
  color: color-mix(in srgb, var(--foreground-color) 75%, transparent);
}

.cardMeta {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--foreground-color) 50%, transparent);
}

.notePreview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 5px;
  font-size: 0.95rem;
  color: color-mix(in srgb, var(--foreground-color) 35%, transparent);
  transition: color 0.15s ease, background-color 0.15s ease;
  flex-shrink: 0;

  &:hover { color: var(--foreground-color); background-color: color-mix(in srgb, var(--foreground-color) 8%, transparent); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.deleteBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 5px;
  font-size: 0.95rem;
  color: color-mix(in srgb, var(--foreground-color) 35%, transparent);
  transition: color 0.15s ease, background-color 0.15s ease;
  flex-shrink: 0;

  &:hover { color: #d94040; background-color: color-mix(in srgb, #d94040 10%, transparent); }
  &:focus-visible { outline: 2px solid var(--foreground-color); outline-offset: 2px; }
}

.empty {
  font-size: 0.82rem;
  color: color-mix(in srgb, var(--foreground-color) 40%, transparent);
  text-align: center;
  padding: 2.5rem 1rem;
  border: 1px dashed color-mix(in srgb, var(--foreground-color) 14%, transparent);
  border-radius: 8px;
  margin: 0;
}
</style>
