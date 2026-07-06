import type {
  AppState,
  Asset,
  AssetEntry,
  Category,
  CurrencyCode,
  Expense,
  FireInputs,
  Language,
  Month,
  RecurringExpense,
  SavingsGoal,
} from './types';
import { CATEGORY_PALETTE, currentMonthKey, monthKey, parseMonthKey, uid } from './utils';

const STORAGE_KEY = 'financial-tracker::v1';

/**
 * Default categories used to seed a fresh install. Keyed by language so a
 * Brazilian user who opens the app for the first time doesn't get English
 * category names they'd have to rename.
 */
const DEFAULT_CATEGORIES_BY_LANG: Record<Language, Omit<Category, 'id'>[]> = {
  en: [
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
  ],
  'pt-BR': [
    { name: 'Moradia', budget: 1200, color: CATEGORY_PALETTE[0] },
    { name: 'Mercado', budget: 400, color: CATEGORY_PALETTE[1] },
    { name: 'Restaurantes', budget: 200, color: CATEGORY_PALETTE[2] },
    { name: 'Transporte', budget: 120, color: CATEGORY_PALETTE[7] },
    { name: 'Contas', budget: 150, color: CATEGORY_PALETTE[4] },
    { name: 'Lazer', budget: 100, color: CATEGORY_PALETTE[5] },
    { name: 'Saúde', budget: 80, color: CATEGORY_PALETTE[8] },
    { name: 'Compras', budget: 150, color: CATEGORY_PALETTE[9] },
    { name: 'Poupança', budget: 500, color: CATEGORY_PALETTE[10] },
    { name: 'Outros', budget: 100, color: CATEGORY_PALETTE[11] },
  ],
};

/** Best-effort detection of the browser's preferred language (en | pt-BR). */
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const raw = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
  return raw.startsWith('pt') ? 'pt-BR' : 'en';
}

function seedMonth(key: string, lang: Language = 'en'): Month {
  const { year, month } = parseMonthKey(key);
  const defaults = DEFAULT_CATEGORIES_BY_LANG[lang] ?? DEFAULT_CATEGORIES_BY_LANG.en;
  return {
    id: key,
    year,
    month,
    categories: defaults.map((c) => ({ ...c, id: uid() })),
    expenses: [],
  };
}

/**
 * Legacy migration: earlier versions stored a static `salary` per month as the
 * budget target. The new model derives the budget from income entries. For any
 * month that still has a positive salary and no income yet, we materialize a
 * single "Monthly income" entry so users don't lose their historical budget.
 */
function migrateSalaryToIncome(monthAny: Record<string, unknown>): Month {
  const raw = monthAny as unknown as Month & { salary?: number };
  const legacySalary = typeof raw.salary === 'number' ? raw.salary : 0;
  const expenses = Array.isArray(raw.expenses) ? [...raw.expenses] : [];
  const hasIncome = expenses.some((e) => e.kind === 'income');

  if (legacySalary > 0 && !hasIncome) {
    const [yStr, mStr] = raw.id.split('-');
    expenses.push({
      id: uid(),
      amount: legacySalary,
      description: 'Monthly income',
      date: `${yStr}-${mStr}-01`,
      createdAt: Date.now(),
      kind: 'income',
    });
  }

  return {
    id: raw.id,
    year: raw.year,
    month: raw.month,
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    expenses,
  };
}

export function defaultState(): AppState {
  const curKey = currentMonthKey();
  const language = detectBrowserLanguage();
  return {
    language,
    theme: 'auto',
    currency: 'EUR',
    months: { [curKey]: seedMonth(curKey, language) },
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

  const fxRatesUpdatedAt =
    typeof raw.fxRatesUpdatedAt === 'string' ? raw.fxRatesUpdatedAt : undefined;
  const savingsGoal =
    raw.savingsGoal &&
    typeof raw.savingsGoal === 'object' &&
    typeof (raw.savingsGoal as Record<string, unknown>).targetAmount === 'number' &&
    typeof (raw.savingsGoal as Record<string, unknown>).targetDate === 'string'
      ? (raw.savingsGoal as AppState['savingsGoal'])
      : undefined;

  // Migrate months to strip legacy `salary` and convert it to income entries.
  const rawMonths = raw.months as Record<string, Record<string, unknown>>;
  const migratedMonths: Record<string, Month> = {};
  for (const [mid, m] of Object.entries(rawMonths)) {
    migratedMonths[mid] = migrateSalaryToIncome(m);
  }

  const state: AppState = {
    language,
    theme,
    currency,
    months: migratedMonths,
    recurringExpenses,
    assets,
    assetEntries,
    conversionRates,
    fxRatesUpdatedAt,
    savingsGoal,
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

  if (!prev) return seedMonth(targetKey, state.language);

  return {
    id: targetKey,
    year,
    month,
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

    const isIncome = r.kind === 'income';
    let catId: string | undefined;
    if (!isIncome) {
      const resolved = resolveCategoryId(month, r);
      if (!resolved) continue; // expense template needs a category
      catId = resolved;
    }

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
      kind: r.kind ?? 'expense',
    });
  }

  if (additions.length === 0) return month;
  return { ...month, expenses: [...month.expenses, ...additions] };
}

function resolveCategoryId(month: Month, r: RecurringExpense): string | null {
  if (!r.categoryId && !r.categoryName) return null;
  const byId = r.categoryId ? month.categories.find((c) => c.id === r.categoryId) : undefined;
  if (byId) return byId.id;
  const byName = month.categories.find(
    (c) => c.name.toLowerCase() === (r.categoryName ?? '').toLowerCase()
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
      categories: Array.from(byId.values()),
    };
  }
  return { ...state, months: nextMonths };
}

export function futureMonthCount(state: AppState, fromMonthId: string): number {
  return Object.keys(state.months).filter((k) => k > fromMonthId).length;
}

/** Current value of an asset in its own currency (latest snapshot or cumulative sum). */
export function assetNativeValue(asset: Asset, entries: AssetEntry[]): number {
  const filtered = entries.filter((e) => e.assetId === asset.id);
  if (filtered.length === 0) return 0;
  if (asset.type === 'snapshot') {
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[sorted.length - 1].amount;
  }
  return filtered.reduce((a, b) => a + b.amount, 0);
}

/** Target amount for a goal: manual for 'amount' type, computed for FIRE. */
export function computeGoalTargetAmount(goal: SavingsGoal): number {
  if (goal.type === 'fire' && goal.fire && !goal.fire.useManual) {
    return computeFireTarget(goal.fire);
  }
  return goal.targetAmount ?? 0;
}

export function computeFireTarget(f: FireInputs): number {
  const swr = f.swr ?? 0.04;
  const expenses = f.annualExpenses ?? 0;
  const fullFire = swr > 0 ? expenses / swr : 0;
  switch (f.variant) {
    case 'regular':
      return fullFire;
    case 'coast': {
      const years = Math.max(0, (f.retirementAge ?? 0) - (f.currentAge ?? 0));
      const realReturn = f.realReturn ?? 0.05;
      return years > 0 ? fullFire / Math.pow(1 + realReturn, years) : fullFire;
    }
    case 'barista': {
      const partTime = f.partTimeAnnualIncome ?? 0;
      return swr > 0 ? Math.max(0, (expenses - partTime) / swr) : 0;
    }
  }
}

/**
 * Estimate when the goal's target will be reached, using the same compounding
 * assumptions as the patrimony projection but weighted by goal contributions.
 * Projects up to 100 years out. Returns:
 *  - The current date if already achieved
 *  - The first month it crosses the target
 *  - null if no projections are enabled among contributing assets, or if the
 *    target is unreachable within 100 years
 */
export function estimateGoalReachDate(
  goal: SavingsGoal,
  assets: Asset[],
  entries: AssetEntry[],
  appCurrency: CurrencyCode,
  conversionRates: Partial<Record<CurrencyCode, number>>
): Date | null {
  const target = computeGoalTargetAmount(goal);
  if (target <= 0) return null;

  const contribs = goal.contributions;
  const assetPrep = assets.map((asset) => {
    const pct = contribs === undefined ? 100 : (contribs[asset.id] ?? 0);
    const weight = pct / 100;
    const rate = asset.currency === appCurrency ? 1 : conversionRates[asset.currency] ?? 1;
    const base = assetNativeValue(asset, entries);
    const proj = asset.type === 'snapshot' ? asset.projection : undefined;
    return {
      weight,
      base,
      rate,
      projected: !!proj?.enabled,
      monthlyRate: proj?.enabled ? Math.pow(1 + proj.annualReturnRate, 1 / 12) - 1 : 0,
      contribution: proj?.enabled ? proj.monthlyContribution : 0,
    };
  });

  const running = assetPrep.map((p) => p.base);
  const evaluate = () =>
    running.reduce((acc, v, i) => acc + v * assetPrep[i].rate * assetPrep[i].weight, 0);

  if (evaluate() >= target) return new Date();

  const anyContributingWithProjection = assetPrep.some(
    (p) => p.projected && p.weight > 0 && (p.base > 0 || p.contribution > 0)
  );
  if (!anyContributingWithProjection) return null;

  const now = new Date();
  const CAP_MONTHS = 100 * 12;
  for (let m = 1; m <= CAP_MONTHS; m++) {
    for (let i = 0; i < assetPrep.length; i++) {
      const p = assetPrep[i];
      if (p.projected) running[i] = running[i] * (1 + p.monthlyRate) + p.contribution;
    }
    if (evaluate() >= target) {
      return new Date(now.getFullYear(), now.getMonth() + m, 1);
    }
  }
  return null;
}

/**
 * Sum of assets weighted by their goal contribution %. When goal.contributions
 * is undefined, every asset contributes 100%. Foreign currencies convert to
 * appCurrency at the current rate.
 */
export function contributingPatrimony(
  goal: SavingsGoal,
  assets: Asset[],
  entries: AssetEntry[],
  appCurrency: CurrencyCode,
  conversionRates: Partial<Record<CurrencyCode, number>>
): number {
  let total = 0;
  for (const asset of assets) {
    const pct =
      goal.contributions === undefined
        ? 100
        : (goal.contributions[asset.id] ?? 0);
    if (pct <= 0) continue;
    const native = assetNativeValue(asset, entries);
    const rate = asset.currency === appCurrency ? 1 : conversionRates[asset.currency] ?? 1;
    total += native * rate * (pct / 100);
  }
  return total;
}

/**
 * Month-by-month actual patrimony from the earliest recorded entry up to the
 * current month. For each month:
 *  - Snapshot assets use the most recent snapshot at or before that month
 *  - Cumulative assets sum all entries at or before that month
 * Foreign currency values convert at the constant current rate.
 */
export function computePatrimonyHistoryPoints(
  assets: Asset[],
  entries: AssetEntry[],
  appCurrency: CurrencyCode,
  conversionRates: Partial<Record<CurrencyCode, number>>
): { date: Date; value: number }[] {
  if (entries.length === 0) return [];

  const earliest = entries.reduce((min, e) => (e.date < min ? e.date : min), entries[0].date);
  const [ey, em] = earliest.split('-').map(Number);
  const earliestMonth = new Date(ey, em - 1, 1);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthsSpan =
    (currentMonth.getFullYear() - earliestMonth.getFullYear()) * 12 +
    (currentMonth.getMonth() - earliestMonth.getMonth());
  if (monthsSpan < 0) return [];

  // Pre-sort entries per asset once
  const entriesByAsset = new Map<string, AssetEntry[]>();
  for (const e of entries) {
    const list = entriesByAsset.get(e.assetId) ?? [];
    list.push(e);
    entriesByAsset.set(e.assetId, list);
  }
  for (const [, list] of entriesByAsset) {
    list.sort((a, b) => a.date.localeCompare(b.date));
  }

  const points: { date: Date; value: number }[] = [];
  for (let m = 0; m <= monthsSpan; m++) {
    const targetMonth = new Date(earliestMonth.getFullYear(), earliestMonth.getMonth() + m, 1);
    // Cutoff is the last day of this month
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    const cutoff = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(endOfMonth.getDate()).padStart(2, '0')}`;

    let total = 0;
    for (const asset of assets) {
      const rate = asset.currency === appCurrency ? 1 : conversionRates[asset.currency] ?? 1;
      const list = entriesByAsset.get(asset.id) ?? [];
      const eligible = list.filter((e) => e.date <= cutoff);
      let native = 0;
      if (asset.type === 'snapshot') {
        if (eligible.length > 0) native = eligible[eligible.length - 1].amount;
      } else {
        native = eligible.reduce((a, b) => a + b.amount, 0);
      }
      total += native * rate;
    }
    points.push({ date: targetMonth, value: total });
  }

  return points;
}

/**
 * Month-by-month projected patrimony across all assets. Snapshot assets with
 * projection enabled compound forward; cumulative assets and un-projected
 * snapshots stay at their current value. Foreign currency values convert at
 * the constant current rate.
 */
export function computePatrimonyProjectionPoints(
  assets: Asset[],
  entries: AssetEntry[],
  appCurrency: CurrencyCode,
  conversionRates: Partial<Record<CurrencyCode, number>>
): { date: Date; value: number }[] {
  const horizons = assets
    .filter((a) => a.projection?.enabled)
    .map((a) => a.projection!.years);
  if (horizons.length === 0) return [];
  const horizonYears = Math.max(...horizons);
  const totalMonths = horizonYears * 12;

  // Pre-compute per-asset base value + monthly compounding parameters.
  const assetPrep = assets.map((asset) => {
    const rate = asset.currency === appCurrency ? 1 : conversionRates[asset.currency] ?? 1;
    const base = assetNativeValue(asset, entries);
    const proj = asset.type === 'snapshot' ? asset.projection : undefined;
    return {
      base,
      rate,
      projected: !!proj?.enabled,
      monthlyRate: proj?.enabled ? Math.pow(1 + proj.annualReturnRate, 1 / 12) - 1 : 0,
      contribution: proj?.enabled ? proj.monthlyContribution : 0,
    };
  });

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const points: { date: Date; value: number }[] = [];

  // Track running values to compound incrementally (O(months × assets), not cubic).
  const running = assetPrep.map((p) => p.base);

  for (let m = 0; m <= totalMonths; m++) {
    if (m > 0) {
      for (let i = 0; i < assetPrep.length; i++) {
        const p = assetPrep[i];
        if (p.projected) {
          running[i] = running[i] * (1 + p.monthlyRate) + p.contribution;
        }
      }
    }
    let total = 0;
    for (let i = 0; i < assetPrep.length; i++) {
      total += running[i] * assetPrep[i].rate;
    }
    const date = new Date(startMonth.getFullYear(), startMonth.getMonth() + m, 1);
    points.push({ date, value: total });
  }

  return points;
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
