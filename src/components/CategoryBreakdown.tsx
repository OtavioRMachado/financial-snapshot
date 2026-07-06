import type { CurrencyCode, Month } from '../types';
import { formatCurrency } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  month: Month;
  /** Optional: the previous month for month-over-month deltas. */
  previousMonth?: Month;
  currency: CurrencyCode;
  onOpenSettings: () => void;
}

interface Row {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  pct: number;
  over: boolean;
  /** % change vs previous month (null if no prior data). */
  delta: number | null;
}

function sumForCategory(m: Month | undefined, categoryId: string): number {
  if (!m) return 0;
  return m.expenses
    .filter((e) => e.categoryId === categoryId && e.kind !== 'income')
    .reduce((a, b) => a + b.amount, 0);
}

export default function CategoryBreakdown({
  month,
  previousMonth,
  currency,
  onOpenSettings,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const rows: Row[] = month.categories.map((c) => {
    const spent = sumForCategory(month, c.id);
    const pct = c.budget > 0 ? (spent / c.budget) * 100 : 0;

    // Delta: match previous-month category by ID first, then name
    let prevSpent: number | null = null;
    if (previousMonth) {
      const prevCat =
        previousMonth.categories.find((x) => x.id === c.id) ??
        previousMonth.categories.find(
          (x) => x.name.toLowerCase() === c.name.toLowerCase()
        );
      prevSpent = prevCat ? sumForCategory(previousMonth, prevCat.id) : null;
    }
    const delta =
      prevSpent !== null && prevSpent > 0 ? ((spent - prevSpent) / prevSpent) * 100 : null;

    return {
      id: c.id,
      name: c.name,
      color: c.color,
      budget: c.budget,
      spent,
      pct,
      over: spent > c.budget && c.budget > 0,
      delta,
    };
  });

  const sorted = [...rows].sort((a, b) => b.pct - a.pct);

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
            {t('category.byCategory')}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{t('category.spentVsBudget')}</div>
        </div>
        <button className="btn-ghost text-xs" onClick={onOpenSettings}>
          {t('category.editBudgets')}
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-sm text-slate-600 dark:text-slate-400 py-6 text-center">{t('category.noneYet')}</div>
      ) : (
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {sorted.map((r) => {
            const cappedPct = Math.min(r.pct, 100);
            return (
              <div key={r.id}>
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="font-medium truncate">{r.name}</span>
                    {r.delta !== null && Math.abs(r.delta) >= 5 && (
                      <span
                        className={`text-[10px] font-medium px-1 py-0.5 rounded ${
                          r.delta > 0
                            ? 'text-rose-500 dark:text-rose-400 bg-rose-500/10'
                            : 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10'
                        }`}
                        title={t('category.deltaTooltip', { pct: r.delta.toFixed(0) })}
                      >
                        {r.delta > 0 ? '+' : ''}
                        {r.delta.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 tabular-nums flex-shrink-0">
                    <span className={r.over ? 'text-rose-400 font-medium' : ''}>
                      {fmt(r.spent)}
                    </span>
                    <span className="text-slate-500"> / {fmt(r.budget)}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface-overlay overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${cappedPct}%`,
                      backgroundColor: r.over ? '#f43f5e' : r.color,
                      opacity: r.pct === 0 ? 0.35 : 1,
                    }}
                  />
                  {r.over && (
                    <div className="absolute inset-y-0 right-0 w-0.5 bg-rose-500 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
