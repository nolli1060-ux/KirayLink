export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(
  amount: number,
  currency: string = "ETB ",
  period: string = "month"
): string {
  const formatted = new Intl.NumberFormat("en-US").format(amount);
  return `${currency}${formatted} / ${period}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function normalizePriceInput(value: string): string {
  if (!value) return "";

  const [whole, fraction] = value.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  return fraction === undefined
    ? normalizedWhole
    : `${normalizedWhole || "0"}.${fraction}`;
}

export function formatCare(care: number | undefined | null): string {
  const safeValue = Number(care ?? 0);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(safeValue);
}

export const DEFAULT_PROPERTY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80";

export function getSafeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return DEFAULT_PROPERTY_FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return DEFAULT_PROPERTY_FALLBACK_IMAGE;
}
