import type { CurrencyCode } from './types';

export const CATEGORY_PALETTE = [
  '#7c5cff', // violet
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#eab308', // yellow
  '#3b82f6', // blue
  '#10b981', // emerald
  '#a855f7', // purple
  '#f97316', // orange
  '#14b8a6', // teal
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

export function currentMonthKey(): string {
  const now = new Date();
  return monthKey(now.getFullYear(), now.getMonth() + 1);
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d.getFullYear(), d.getMonth() + 1);
}

export function formatMonthLong(key: string, locale?: string): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatMonthShort(key: string, locale?: string): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

export function formatDateReadable(iso: string, locale?: string): string {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

const CURRENCY_META: Record<CurrencyCode, { fallbackLocale: string; symbol: string }> = {
  EUR: { fallbackLocale: 'de-DE', symbol: '€' },
  USD: { fallbackLocale: 'en-US', symbol: '$' },
  BRL: { fallbackLocale: 'pt-BR', symbol: 'R$' },
  GBP: { fallbackLocale: 'en-GB', symbol: '£' },
};

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCY_META[code].symbol;
}

export function formatCurrency(
  amount: number,
  code: CurrencyCode,
  opts?: { compact?: boolean; locale?: string }
): string {
  const meta = CURRENCY_META[code];
  const locale = opts?.locale ?? meta.fallbackLocale;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: opts?.compact ? 0 : 2,
      minimumFractionDigits: opts?.compact ? 0 : 2,
    }).format(amount);
  } catch {
    return `${meta.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCurrencyShort(amount: number, code: CurrencyCode, locale?: string): string {
  const meta = CURRENCY_META[code];
  const useLocale = locale ?? meta.fallbackLocale;
  try {
    return new Intl.NumberFormat(useLocale, {
      style: 'currency',
      currency: code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${meta.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateAxis(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
}

export function formatDateFull(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
