// formatAmount is auto-imported from app/utils/formatCurrency by Nuxt
import type { InvoiceConfig } from "~/types/invoice";

export function useCurrencyFormat() {
  function format(amount: number, config: InvoiceConfig) {
    return formatAmount(amount, config.currency, config.locale);
  }

  function rowTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  function grandTotal(
    items: { unitPrice: number; quantity: number }[],
  ): number {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  return { format, rowTotal, grandTotal };
}
