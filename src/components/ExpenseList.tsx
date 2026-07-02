import { useMemo, useState } from 'react';
import { Trash2, Search, Receipt, Repeat, CircleSlash } from 'lucide-react';
import type { CurrencyCode, Expense, Month, RecurringExpense } from '../types';
import { formatCurrency, formatDateReadable } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  month: Month;
  currency: CurrencyCode;
  recurring: RecurringExpense[];
  onDelete: (expenseId: string) => void;
  onStopRecurring: (recurringId: string) => void;
}

export default function ExpenseList({
  month,
  currency,
  recurring,
  onDelete,
  onStopRecurring,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const catById = useMemo(() => {
    const m: Record<string, { name: string; color: string }> = {};
    for (const c of month.categories) m[c.id] = { name: c.name, color: c.color };
    return m;
  }, [month.categories]);

  const recurringById = useMemo(() => {
    const m: Record<string, RecurringExpense> = {};
    for (const r of recurring) m[r.id] = r;
    return m;
  }, [recurring]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return month.expenses
      .filter((e) => filterCat === 'all' || e.categoryId === filterCat)
      .filter((e) => {
        if (!q) return true;
        return (
          e.description.toLowerCase().includes(q) ||
          (catById[e.categoryId]?.name.toLowerCase() ?? '').includes(q)
        );
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }, [month.expenses, filterCat, query, catById]);

  const grouped = useMemo(() => {
    const g: Record<string, Expense[]> = {};
    for (const e of filtered) {
      if (!g[e.date]) g[e.date] = [];
      g[e.date].push(e);
    }
    return Object.entries(g);
  }, [filtered]);

  const totalCount = month.expenses.length;
  const recurringCount = month.expenses.filter((e) => e.recurringId).length;

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3 border-b border-surface-border">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Receipt size={16} className="text-slate-600 dark:text-slate-400" />
            {t('expenseList.title')}
            <span className="chip !py-0.5 !px-2">{totalCount}</span>
            {recurringCount > 0 && (
              <span className="chip !py-0.5 !px-2 !text-accent-soft border-accent/30 bg-accent/10">
                <Repeat size={11} />
                {t('expenseList.recurringCount', { n: recurringCount })}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 sm:max-w-md sm:ml-auto">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder={t('common.search')}
              className="input pl-8 !py-1.5 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="input appearance-none !py-1.5 text-sm w-auto"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">{t('expenseList.allCategories')}</option>
            {month.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="p-12 text-center text-slate-600 dark:text-slate-400">
          <Receipt size={32} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
          <div className="font-medium text-slate-700 dark:text-slate-300">{t('expenseList.emptyTitle')}</div>
          <div className="text-sm mt-1">
            {t('addExpense.emptySubtitlePrefix')}{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-overlay border border-surface-border text-slate-700 dark:text-slate-300">
              N
            </kbd>{' '}
            {t('addExpense.emptySubtitleSuffix')}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-600 dark:text-slate-400 text-sm">{t('expenseList.noMatches')}</div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto">
          {grouped.map(([date, items]) => {
            const dayTotal = items.reduce((a, b) => a + b.amount, 0);
            return (
              <div key={date}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-2 bg-surface-raised/95 backdrop-blur border-b border-surface-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 capitalize">
                    {formatDateReadable(date, locale)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">{fmt(dayTotal)}</span>
                </div>
                <ul>
                  {items.map((e) => {
                    const cat = catById[e.categoryId];
                    const rec = e.recurringId ? recurringById[e.recurringId] : undefined;
                    return (
                      <li
                        key={e.id}
                        className="group flex items-center gap-3 px-5 py-3 border-b border-surface-border/60 hover:bg-surface-overlay/40 transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat?.color ?? '#666' }}
                          title={cat?.name}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate text-sm">
                              {e.description || (
                                <span className="text-slate-500 italic">
                                  {t('expenseList.noDescription')}
                                </span>
                              )}
                            </span>
                            {rec && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-accent/15 text-accent-soft border border-accent/25 flex-shrink-0"
                                title={
                                  rec.endMonthId
                                    ? t('expenseList.recurringTooltip', { through: rec.endMonthId })
                                    : t('expenseList.recurringTooltipIndef')
                                }
                              >
                                <Repeat size={9} />
                                {rec.endMonthId
                                  ? t('expenseList.recurringBadge')
                                  : t('expenseList.recurringBadgeIndef')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {cat?.name ?? t('expenseList.unknownCategory')}
                          </div>
                        </div>
                        <div className="tabular-nums text-sm font-medium">{fmt(e.amount)}</div>
                        <div className="flex items-center gap-0.5">
                          {rec && (
                            <button
                              className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:!text-amber-400"
                              onClick={() => {
                                if (confirm(t('expenseList.stopConfirm'))) {
                                  onStopRecurring(rec.id);
                                }
                              }}
                              aria-label={t('expenseList.stopRecurrenceTitle')}
                              title={t('expenseList.stopRecurrenceTitle')}
                            >
                              <CircleSlash size={15} />
                            </button>
                          )}
                          <button
                            className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:!text-rose-400"
                            onClick={() => onDelete(e.id)}
                            aria-label={t('common.delete')}
                            title={t('expenseList.deleteTitle')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
