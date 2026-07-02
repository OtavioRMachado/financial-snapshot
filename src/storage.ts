import type {
  AppState,
  Asset,
  AssetEntry,
  Category,
  CurrencyCode,
  Expense,
  Month,
  RecurringExpense,
} from './types';
import { CATEGORY_PALETTE, currentMonthKey, monthKey, parseMonthKey, uid } from './utils';

const STORAGE_KEY = 'financial-tracker::v1';

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Housing', budget: 1200, color: CATEGORY_PALETTE[0] },
  { name: 'Groceries', budget: 400, color: CATEGORY_PALETTE[1] },
  { name: 'Dining', budget: 200, color: CATEGORY_PALETTE[2] },
  { name: 'Transport', budget: 120, color: CATEGORY_PALETTE[7] },
  { name: 'Utilities', budget: 150, color: CATEGORY_PALETTE[4] },
  { name: 'Entertainment', budget: 100, color: CATEGORY_PALETTE[5] },
  { name: 'Health', budget: 80, color: CATEGORY_PALETTE[8] },
  { name: 'Shopping', budget: 150, color: CATEGORY_PALETTE[9] },
  { name: 'Savings', budget: 500, color: CATEGORY_PALETTE[10] },
  { name: 'Other', budget: 100, color: CATEGORY_PALETTE[11] },
];

function seedMonth(key: string): Month {
  const { year, month } = parseMonthKey(key);
  return {
    id: key,
    year,
    month,
    salary: 3000,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, id: uid() })),
    expenses: [],
  };
}

export function defaultState(): AppState {
  const curKey = currentMonthKey();
  return {
    language: 'en',
    theme: 'auto',
    currency: 'EUR',
    months: { [curKey]: seedMonth(curKey) },
    recurringExpenses: [],
    assets: [],
    assetEntries: [],
    conversionRates: { USD: 0.92, BRL: 0.16 },
  };
}

/**
 * Take any parsed data (from localStorage or an import file) and return a valid
 * AppState, filling in defaults for missing fields.
 */
export function normalizeState(input: unknown): AppState {
  if (!input || typeof input !== 'object') throw new Error('Invalid data');
  const raw = input as Record<string, unknown>;
  if (!raw.months || typeof raw.months !== 'object') throw new Error('Missing months');

  const assets: Asset[] = Array.isArray(raw.assets) ? (raw.assets as Asset[]) : [];
  const assetEntries: AssetEntry[] = Array.isArray(raw.assetEntries)
    ? (raw.assetEntries as AssetEntry[])
    : [];

  const stored =
    typeof raw.conversionRates === 'object' && raw.conversionRates !== null
      ? (raw.conversionRates as Partial<Record<CurrencyCode, number>>)
      : {};
  const conversionRates: Partial<Record<CurrencyCode, number>> = { ...stored };

  const language = raw.language === 'pt-BR' ? 'pt-BR' : 'en';
  const theme =
    raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'auto'
      ? raw.theme
      : 'auto';
  const currency: CurrencyCode = (raw.currency as CurrencyCode) ?? 'EUR';
  const recurringExpenses = Array.isArray(raw.recurringExpenses)
    ? (raw.recurringExpenses as RecurringExpense[])
    : [];

  const state: AppState = {
    language,
    theme,
    currency,
    months: raw.months as Record<string, Month>,
    recurringExpenses,
    assets,
    assetEntries,
    conversionRates,
  };

  const curKey = currentMonthKey();
  if (!state.months[curKey]) {
    state.months[curKey] = deriveNextMonth(state, curKey);
  }
  for (const mid of Object.keys(state.months)) {
    state.months[mid] = materializeRecurringForMonth(state.months[mid], state.recurringExpenses);
  }

  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state', err);
  }
}

export function resetState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state', err);
  }
}

export function stateSummary(state: AppState): {
  months: number;
  expenses: number;
  assets: number;
  assetEntries: number;
} {
  const months = Object.keys(state.months).length;
  const expenses = Object.values(state.months).reduce((acc, m) => acc + m.expenses.length, 0);
  return {
    months,
    expenses,
    assets: state.assets.length,
    assetEntries: state.assetEntries.length,
  };
}

/**
 * Build a month from the most recent existing month (by key order),
 * copying salary + category budgets. Expenses start empty; recurring
 * materialization is applied separately by ensureMonth / loadState.
 */
export function deriveNextMonth(state: AppState, targetKey: string): Month {
  const { year, month } = parseMonthKey(targetKey);
  const previousKeys = Object.keys(state.months)
    .filter((k) => k < targetKey)
    .sort();
  const prev = previousKeys.length
    ? state.months[previousKeys[previousKeys.length - 1]]
    : undefined;

  if (!prev) return seedMonth(targetKey);

  return {
    id: targetKey,
    year,
    month,
    salary: prev.salary,
    categories: prev.categories.map((c) => ({
      id: c.id,
      name: c.name,
      budget: c.budget,
      color: c.color,
    })),
    expenses: [],
  };
}

export function ensureMonth(state: AppState, key: string): AppState {
  const existing = state.months[key];
  if (existing) {
    const patched = materializeRecurringForMonth(existing, state.recurringExpenses);
    if (patched === existing) return state;
    return { ...state, months: { ...state.months, [key]: patched } };
  }
  const base = deriveNextMonth(state, key);
  const withRecurring = materializeRecurringForMonth(base, state.recurringExpenses);
  return { ...state, months: { ...state.months, [key]: withRecurring } };
}

export function materializeRecurringForMonth(month: Month, recurring: RecurringExpense[]): Month {
  const alreadyPresent = new Set(
    month.expenses.filter((e) => e.recurringId).map((e) => e.recurringId as string)
  );
  const additions: Expense[] = [];

  for (const r of recurring) {
    if (alreadyPresent.has(r.id)) continue;
    if (month.id < r.startMonthId) continue;
    if (r.endMonthId && month.id > r.endMonthId) continue;

    const catId = resolveCategoryId(month, r);
    if (!catId) continue;

    const daysInMonth = new Date(month.year, month.month, 0).getDate();
    const day = Math.min(Math.max(1, r.dayOfMonth), daysInMonth);
    const iso = `${month.year}-${String(month.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    additions.push({
      id: uid(),
      amount: r.amount,
      description: r.description,
      categoryId: catId,
      date: iso,
      createdAt: Date.now(),
      recurringId: r.id,
    });
  }

  if (additions.length === 0) return month;
  return { ...month, expenses: [...month.expenses, ...additions] };
}

function resolveCategoryId(month: Month, r: RecurringExpense): string | null {
  const byId = month.categories.find((c) => c.id === r.categoryId);
  if (byId) return byId.id;
  const byName = month.categories.find(
    (c) => c.name.toLowerCase() === r.categoryName.toLowerCase()
  );
  return byName ? byName.id : null;
}

export function addRecurring(state: AppState, recurring: RecurringExpense): AppState {
  const nextRecurring = [...state.recurringExpenses, recurring];
  const nextMonths: Record<string, Month> = { ...state.months };
  for (const mid of Object.keys(nextMonths)) {
    if (mid < recurring.startMonthId) continue;
    if (recurring.endMonthId && mid > recurring.endMonthId) continue;
    nextMonths[mid] = materializeRecurringForMonth(nextMonths[mid], [recurring]);
  }
  return { ...state, recurringExpenses: nextRecurring, months: nextMonths };
}

export function stopRecurring(
  state: AppState,
  recurringId: string,
  fromMonthId: string
): AppState {
  const nextRecurring = state.recurringExpenses.filter((r) => r.id !== recurringId);
  const nextMonths: Record<string, Month> = {};
  for (const [mid, m] of Object.entries(state.months)) {
    if (mid < fromMonthId) {
      nextMonths[mid] = m;
      continue;
    }
    nextMonths[mid] = {
      ...m,
      expenses: m.expenses.filter((e) => e.recurringId !== recurringId),
    };
  }
  return { ...state, recurringExpenses: nextRecurring, months: nextMonths };
}

export function monthKeyList(state: AppState): string[] {
  return Object.keys(state.months).sort();
}

export function applyBudgetsToFutureMonths(
  state: AppState,
  fromMonthId: string,
  salary: number,
  categories: Category[]
): AppState {
  const nextMonths: Record<string, Month> = {};
  for (const [mid, m] of Object.entries(state.months)) {
    if (mid <= fromMonthId) {
      nextMonths[mid] = m;
      continue;
    }
    const byId = new Map(m.categories.map((c) => [c.id, c]));
    for (const c of categories) byId.set(c.id, { ...c });
    nextMonths[mid] = {
      ...m,
      salary,
      categories: Array.from(byId.values()),
    };
  }
  return { ...state, months: nextMonths };
}

export function futureMonthCount(state: AppState, fromMonthId: string): number {
  return Object.keys(state.months).filter((k) => k > fromMonthId).length;
}

/**
 * Compute the current and projected total patrimony in the app currency.
 * Uses a common horizon = max years across enabled projections. Assets without
 * projection contribute their current value unchanged. Foreign-currency assets
 * are converted at the stored rate (assumed constant).
 */
export function computePatrimonyForecast(
  assets: Asset[],
  entries: AssetEntry[],
  appCurrency: CurrencyCode,
  conversionRates: Partial<Record<CurrencyCode, number>>
): {
  currentTotal: number;
  projectedTotal: number;
  horizonYears: number;
  gain: number;
  hasProjection: boolean;
} {
  const horizons = assets
    .filter((a) => a.projection?.enabled)
    .map((a) => a.projection!.years);
  const hasProjection = horizons.length > 0;
  const horizonYears = hasProjection ? Math.max(...horizons) : 0;
  const totalMonths = horizonYears * 12;

  let currentTotal = 0;
  let projectedTotal = 0;

  for (const asset of assets) {
    const rate = asset.currency === appCurrency ? 1 : conversionRates[asset.currency] ?? 1;
    const filtered = entries.filter((e) => e.assetId === asset.id);

    let native = 0;
    if (asset.type === 'snapshot') {
      if (filtered.length) {
        const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
        native = sorted[sorted.length - 1].amount;
      }
    } else {
      native = filtered.reduce((a, b) => a + b.amount, 0);
    }

    currentTotal += native * rate;

    let projectedNative = native;
    if (asset.projection?.enabled && totalMonths > 0) {
      const monthlyRate = Math.pow(1 + asset.projection.annualReturnRate, 1 / 12) - 1;
      let v = native;
      for (let i = 0; i < totalMonths; i++) {
        v = v * (1 + monthlyRate) + asset.projection.monthlyContribution;
      }
      projectedNative = v;
    }
    projectedTotal += projectedNative * rate;
  }

  return {
    currentTotal,
    projectedTotal,
    horizonYears,
    gain: projectedTotal - currentTotal,
    hasProjection,
  };
}

export { monthKey };
