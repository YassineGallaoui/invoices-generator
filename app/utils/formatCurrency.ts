export interface FormattedAmount {
  symbol: string;
  whole: string;
  cents: string;
}

/**
 * Splits a numeric amount into symbol + whole + cents parts so the cents
 * portion can be rendered at a smaller font size (9px per spec).
 */
export function formatAmount(
  amount: number,
  symbol: string,
  locale: string = "en-US",
): FormattedAmount {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Detect the decimal separator for this locale
  const decimalChar = new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find((p) => p.type === "decimal")?.value;

  if (decimalChar && formatted.includes(decimalChar)) {
    const idx = formatted.lastIndexOf(decimalChar);
    return {
      symbol,
      whole: formatted.slice(0, idx),
      cents: formatted.slice(idx + 1),
    };
  }

  return { symbol, whole: formatted, cents: "00" };
}
