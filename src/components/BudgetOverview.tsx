import type { CurrencyCode, Month } from '../types';
import { formatCurrency } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  month: Month;
  currency: CurrencyCode;
}

export default function BudgetOverview({ month, currency }: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const spent = month.expenses
    .filter((e) => e.kind !== 'income')
    .reduce((a, b) => a + b.amount, 0);
  const income = month.expenses
    .filter((e) => e.kind === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const budget = income;
  const remaining = budget - spent;
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const cappedPct = Math.min(pct, 100);
  const overBudget = spent > budget && budget > 0;

  const barColor =
    pct >= 100
      ? 'from-rose-500 to-red-500'
      : pct >= 90
        ? 'from-amber-400 to-orange-500'
        : pct >= 70
          ? 'from-yellow-400 to-amber-400'
          : 'from-emerald-400 to-teal-400';

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
            {t('budget.overview')}
          </div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight">{fmt(spent)}</span>
            {budget > 0 && (
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {t('common.of')} {fmt(budget)}
              </span>
            )}
          </div>
        </div>
        {budget > 0 ? (
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
              {overBudget ? t('budget.overBy') : t('budget.remaining')}
            </div>
            <div
              className={`mt-1 text-2xl sm:text-3xl font-semibold tracking-tight ${
                overBudget
                  ? 'text-rose-400'
                  : remaining < budget * 0.1
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {fmt(Math.abs(remaining))}
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
              {t('budget.income')}
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-500">
              {fmt(0)}
            </div>
          </div>
        )}
      </div>

      <div className="relative h-3 rounded-full bg-surface-overlay overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor} transition-[width] duration-500 ease-out`}
          style={{ width: `${cappedPct}%` }}
        />
        {overBudget && (
          <div className="absolute inset-y-0 right-0 w-1 bg-rose-500 animate-pulse" />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2 flex-wrap">
        <span>{t('budget.percentUsed', { n: pct.toFixed(0) })}</span>
        {budget === 0 ? (
          <span className="text-amber-400">{t('budget.addIncomeHint')}</span>
        ) : overBudget ? (
          <span className="text-rose-400 font-medium">{t('budget.exceeded')}</span>
        ) : (
          <span>{t('budget.percentLeft', { n: (100 - cappedPct).toFixed(0) })}</span>
        )}
      </div>
    </div>
  );
}
