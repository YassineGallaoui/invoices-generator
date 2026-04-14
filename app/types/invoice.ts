export type Currency = "$" | "€" | "£" | "¥" | (string & {});

export interface InvoiceConfig {
  baseFontPx: number; // 11
  preheaderTextPx: number; // 14
  tableHeaderPx: number; // 9 (bold)
  primaryInfoPx: number; // 14 (bold)
  secondaryInfoPx: number; // 11
  centsPx: number; // 9
  currency: Currency;
  locale: string; // e.g. "en-US"
  // PDF page margins in points (1pt ≈ 0.35 mm; A4 default is ~28pt)
  marginTop: number; // default 40
  marginRight: number; // default 40
  marginBottom: number; // default 40
  marginLeft: number; // default 40
  // Highlight color for section header labels (FROM, TO, QTY, PAYMENT DETAILS, NOTES)
  // Empty string = no highlight
  headerColor: string;
}

export interface Preheader {
  kind: "text" | "logo";
  text: string; // default "Invoice"
  logoDataUrl: string; // base64 data URL
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
}

export interface Party {
  id: string;
  label: string; // preset nickname
  name: string; // primary (14px bold)
  address1: string;
  address2: string;
  vatNumber: string;
  cf: string; // Codice Fiscale (Italy)
  email: string;
  phone: string;
  extra: string[]; // additional secondary lines
}

export interface LineItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface ItemsSection {
  id: string;
  unit: string; // shown in QTY column header, e.g. "hours" → "QTY (hours)"
  items: LineItem[];
}

export interface PaymentDetails {
  id: string;
  label: string;
  iban: string;
  bicSwift: string;
  extra: string;
}

export interface Invoice {
  id: string; // UUID
  createdAt: string; // ISO
  updatedAt: string; // ISO
  config: InvoiceConfig;
  preheader: Preheader;
  from: Party;
  to: Party;
  items: ItemsSection[];
  payment: PaymentDetails;
  notesHtml: string; // sanitized HTML
}

export interface InvoiceListEntry {
  id: string;
  label: string; // derived: preheader text or "Invoice"
  invoiceNumber: string;
  updatedAt: string;
}

export interface Presets {
  businesses: Party[];
  clients: Party[];
  paymentMethods: PaymentDetails[];
  logos: { id: string; label: string; dataUrl: string }[];
  notes: { id: string; label: string; html: string }[];
}

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
  baseFontPx: 11,
  preheaderTextPx: 14,
  tableHeaderPx: 9,
  primaryInfoPx: 14,
  secondaryInfoPx: 11,
  centsPx: 9,
  currency: "$",
  locale: "en-US",
  marginTop: 40,
  marginRight: 40,
  marginBottom: 40,
  marginLeft: 40,
  headerColor: "",
};
