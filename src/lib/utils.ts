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

export function formatCare(care: number | undefined | null): string {
  const safeValue = Number(care ?? 0);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(safeValue);
}
