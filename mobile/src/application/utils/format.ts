export function formatCurrency(
  amount: number | undefined | null,
  currency?: string
): string {
  if (amount == null) return "";
  const cur = currency || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback when Intl doesn't support the currency
    return `${amount.toFixed(2)} ${cur}`;
  }
}

export function formatNumber(
  n: number | undefined | null,
  fractionDigits = 2
): string {
  if (n == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n);
  }
}
