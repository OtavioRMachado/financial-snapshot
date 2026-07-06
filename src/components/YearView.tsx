import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { CurrencyCode, Month } from '../types';
import { formatCurrency } from '../utils';
import { useT, useLocale } from '../i18n';
import CategoryPieChart, { type CategorySliceInput } from './CategoryPieChart';

interface Props {
  year: number;
  months: Record<string, Month>;
  currency: CurrencyCode;
}

interface CategoryYearRollup {
  categoryName: string;
  color: string;
  total: number;
  budgetSum: number;
}

export default function YearView({ year, months, currency }: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const { categories, totals, pieSlices } = useMemo(() => {
    const categoryTotals: Record<string, CategoryYearRollup> = {};
    const sliceMap = new Map<string, CategorySliceInput>();
    let expensesTotal = 0;
    let incomeTotal = 0;

    for (let mNum = 1; mNum <= 12; mNum++) {
      const key = `${year}-${String(mNum).padStart(2, '0')}`;
      const m = months[key];
      if (!m) continue;

      for (const e of m.expenses) {
        if (e.kind === 'income') {
          incomeTotal += e.amount;
          continue;
        }
        expensesTotal += e.amount;
        const cat = e.categoryId ? m.categories.find((c) => c.id === e.categoryId) : undefined;
        const name = cat?.name ?? t('expenseList.unknownCategory');
        const color = cat?.color ?? '#666';
        const bucket = categoryTotals[name] ?? {
          categoryName: name,
          color,
          total: 0,
          budgetSum: 0,
        };
        bucket.total += e.amount;
        categoryTotals[name] = bucket;

        let slice = sliceMap.get(name);
        if (!slice) {
          slice = { id: name, name, color, expenses: [] };
          sliceMap.set(name, slice);
        }
        slice.expenses.push(e);
      }
      for (const c of m.categories) {
        const b = categoryTotals[c.name];
        if (b) b.budgetSum += c.budget;
      }
    }

    const cats = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
    const pieSlices = Array.from(sliceMap.values());
    return {
      categories: cats,
      totals: { expenses: expensesTotal, income: incomeTotal },
      pieSlices,
    };
  }, [year, months, t]);

  const net = totals.expenses - totals.income;
  const maxCatTotal = Math.max(...categories.map((c) => c.total), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Totals summary */}
      <div className="card p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
              {t('yearView.totalExpenses')}
            </div>
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {fmt(totals.expenses)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
              {t('yearView.totalIncome')}
            </div>
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-emerald-500 dark:text-emerald-400">
              {fmt(totals.income)}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
              {t('yearView.net')}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2 ${
                net > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
              }`}
            >
              {net > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {fmt(Math.abs(net))}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {net > 0 ? t('yearView.netNegative') : t('yearView.netPositive')}
            </div>
          </div>
        </div>
      </div>

      {/* Pie chart */}
      <CategoryPieChart
        slices={pieSlices}
        currency={currency}
        title={t('pie.titleYear')}
        subtitle={t('pie.subtitle')}
      />

      {/* Category totals */}
      <div className="card p-4 sm:p-6">
        <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium mb-4">
          {t('yearView.byCategory')}
        </div>
        {categories.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">{t('yearView.noData')}</div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => {
              const pct = (c.total / maxCatTotal) * 100;
              const budgetPct =
                c.budgetSum > 0 ? (c.total / c.budgetSum) * 100 : null;
              return (
                <div key={c.categoryName}>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="font-medium truncate">{c.categoryName}</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 tabular-nums flex-shrink-0 text-right">
                      <div>{fmt(c.total)}</div>
                      {budgetPct !== null && (
                        <div className="text-[10px] text-slate-500">
                          {budgetPct.toFixed(0)}% {t('yearView.ofBudget')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-surface-overlay overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
