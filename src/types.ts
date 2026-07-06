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

export type EntryKind = 'expense' | 'income';

export interface Expense {
  id: string;
  /** Required for expense entries; omitted for income (income is uncategorized). */
  categoryId?: string;
  amount: number;
  description: string;
  /** ISO date string, day granularity: YYYY-MM-DD */
  date: string;
  /** Millis, when the record was added — for ordering same-date items */
  createdAt: number;
  /** Set when this expense was materialized from a recurring template */
  recurringId?: string;
  /** Default 'expense'. Income entries feed the monthly budget. */
  kind?: EntryKind;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  /** Required for expense templates; omitted for income templates. */
  categoryId?: string;
  /** Used as a fallback when reconciling categoryId across months. Empty for income. */
  categoryName: string;
  dayOfMonth: number;
  startMonthId: string;
  endMonthId: string | null;
  /** Default 'expense'. */
  kind?: EntryKind;
}

export interface Month {
  id: string;
  year: number;
  month: number;
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

export type FireVariant = 'regular' | 'coast' | 'barista';

export interface FireInputs {
  variant: FireVariant;
  /** true = ignore inputs, use the SavingsGoal.targetAmount as the number */
  useManual: boolean;
  annualExpenses?: number;
  /** Safe Withdrawal Rate, e.g. 0.04 for 4% */
  swr?: number;
  // Coast-specific
  currentAge?: number;
  retirementAge?: number;
  /** Expected real (inflation-adjusted) annual return, e.g. 0.05 */
  realReturn?: number;
  // Barista-specific
  partTimeAnnualIncome?: number;
}

export interface SavingsGoal {
  /** Undefined treated as 'amount' for backward compat */
  type?: 'amount' | 'fire';
  /** Manual target (for 'amount' or 'fire' with useManual=true) */
  targetAmount?: number;
  /** YYYY-MM-DD. Required for 'amount' goals; ignored for FIRE (reach date is computed). */
  targetDate?: string;
  label?: string;
  /** Present only for FIRE goals */
  fire?: FireInputs;
  /**
   * Per-asset contribution percentage (0-100). Missing → every asset contributes 100%.
   * Present with a subset of assets → only those contribute at the specified %.
   */
  contributions?: Record<string, number>;
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
  /** ISO timestamp of the last FX refresh, if any */
  fxRatesUpdatedAt?: string;
  /** Optional single savings target */
  savingsGoal?: SavingsGoal;
}
