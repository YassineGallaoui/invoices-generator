import type { InvoiceConfig } from "~/types/invoice";
import { DEFAULT_INVOICE_CONFIG } from "~/types/invoice";

const CSS_PROPS: Record<keyof InvoiceConfig, string | null> = {
  baseFontPx: "--inv-base-px",
  preheaderTextPx: "--inv-preheader-px",
  tableHeaderPx: "--inv-header-px",
  primaryInfoPx: "--inv-primary-px",
  secondaryInfoPx: "--inv-secondary-px",
  centsPx: "--inv-cents-px",
  currency: null,
  locale: null,
  // Margins are PDF-only; no CSS custom property needed
  marginTop: null,
  marginRight: null,
  marginBottom: null,
  marginLeft: null,
  headerColor: "--inv-header-color",
};

function applyConfig(cfg: InvoiceConfig) {
  if (import.meta.server) return;
  const root = document.documentElement;
  for (const [key, prop] of Object.entries(CSS_PROPS)) {
    if (!prop) continue;
    const val = cfg[key as keyof InvoiceConfig];
    root.style.setProperty(prop, String(val));
  }
}

export function useInvoiceConfig() {
  const config = useStorageState<InvoiceConfig>(
    "inv:config",
    DEFAULT_INVOICE_CONFIG,
  );

  onMounted(() => applyConfig(config.value));
  watch(config, applyConfig, { deep: true });

  function resetConfig() {
    config.value = structuredClone(DEFAULT_INVOICE_CONFIG);
  }

  return { config, resetConfig };
}
