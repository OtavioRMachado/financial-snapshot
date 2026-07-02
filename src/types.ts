export type CurrencyCode = 'EUR' | 'USD' | 'BRL' | 'GBP';
export type Language = 'en' | 'pt-BR';
/** Theme preference. `auto` follows the OS `prefers-color-scheme`. */
export type Theme = 'auto' | 'light' | 'dark';

export interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  /** ISO date string, day granularity: YYYY-MM-DD */
  date: string;
  /** Millis, when the record was added — for ordering same-date items */
  createdAt: number;
  /** Set when this expense was materialized from a recurring template */
  recurringId?: string;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  dayOfMonth: number;
  startMonthId: string;
  endMonthId: string | null;
}

export interface Month {
  id: string;
  year: number;
  month: number;
  salary: number;
  categories: Category[];
  expenses: Expense[];
}

/**
 * How the user records data for this asset.
 * - snapshot: each entry replaces "current value". Latest entry = current balance.
 * - cumulative: each entry adds to a running total (e.g. RSU vests).
 */
export type AssetType = 'snapshot' | 'cumulative';

export interface AssetProjection {
  enabled: boolean;
  annualReturnRate: number; // e.g. 0.07
  monthlyContribution: number;
  years: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  /** Currency in which entries for this asset are recorded */
  currency: CurrencyCode;
  color: string;
  /** Icon key from ASSET_ICONS in components/assetIcons.ts */
  icon: string;
  /** Optional projection settings — only meaningful for snapshot-type assets */
  projection?: AssetProjection;
}

export interface AssetEntry {
  id: string;
  assetId: string;
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  note?: string;
}

export interface AppState {
  language: Language;
  theme: Theme;
  currency: CurrencyCode;
  months: Record<string, Month>;
  recurringExpenses: RecurringExpense[];
  assets: Asset[];
  assetEntries: AssetEntry[];
  /** Units of the app currency per 1 unit of the key currency. Ignored for the app currency itself. */
  conversionRates: Partial<Record<CurrencyCode, number>>;
}
