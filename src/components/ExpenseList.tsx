import { useMemo, useState } from 'react';
import {
  Trash2,
  Search,
  Receipt,
  Repeat,
  CircleSlash,
  ArrowDownLeft,
} from 'lucide-react';
import type { CurrencyCode, Expense, Month, RecurringExpense } from '../types';
import { formatCurrency, formatDateReadable, formatMonthShort } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  month: Month;
  currency: CurrencyCode;
  recurring: RecurringExpense[];
  /** All months keyed by id, for cross-month search. */
  allMonths: Record<string, Month>;
  onDelete: (expenseId: string, monthId: string) => void;
  onStopRecurring: (recurringId: string) => void;
}

interface RowExpense extends Expense {
  monthId: string;
}

export default function ExpenseList({
  month,
  currency,
  recurring,
  allMonths,
  onDelete,
  onStopRecurring,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchAll, setSearchAll] = useState(false);

  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  // Category lookup — need one that spans all months when searching globally
  const catLookup = useMemo(() => {
    const byMonthAndId: Record<string, Record<string, { name: string; color: string }>> = {};
    for (const [mid, m] of Object.entries(allMonths)) {
      const inner: Record<string, { name: string; color: string }> = {};
      for (const c of m.categories) inner[c.id] = { name: c.name, color: c.color };
      byMonthAndId[mid] = inner;
    }
    return byMonthAndId;
  }, [allMonths]);

  const recurringById = useMemo(() => {
    const m: Record<string, RecurringExpense> = {};
    for (const r of recurring) m[r.id] = r;
    return m;
  }, [recurring]);

  const active = searchAll ? Object.values(allMonths) : [month];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows: RowExpense[] = [];
    for (const m of active) {
      for (const e of m.expenses) {
        rows.push({ ...e, monthId: m.id });
      }
    }
    return rows
      .filter((e) => filterCat === 'all' || e.categoryId === filterCat)
      .filter((e) => {
        if (!q) return true;
        const catName = e.categoryId
          ? catLookup[e.monthId]?.[e.categoryId]?.name ?? ''
          : '';
        return (
          e.description.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }, [active, filterCat, query, catLookup]);

  const grouped = useMemo(() => {
    const g: Record<string, RowExpense[]> = {};
    for (const e of filtered) {
      if (!g[e.date]) g[e.date] = [];
      g[e.date].push(e);
    }
    return Object.entries(g);
  }, [filtered]);

  const totalCount = active.reduce((acc, m) => acc + m.expenses.length, 0);
  const recurringCount = active.reduce(
    (acc, m) => acc + m.expenses.filter((e) => e.recurringId).length,
    0
  );

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 p-4 sm:p-5 sm:pb-3 border-b border-surface-border">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 flex-wrap">
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
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none sm:ml-auto">
          <input
            type="checkbox"
            className="accent-accent"
            checked={searchAll}
            onChange={(e) => setSearchAll(e.target.checked)}
          />
          {t('expenseList.searchAllMonths')}
        </label>
      </div>

      {totalCount === 0 ? (
        <div className="p-8 sm:p-12 text-center text-slate-600 dark:text-slate-400">
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
            const dayExpenses = items
              .filter((i) => i.kind !== 'income')
              .reduce((a, b) => a + b.amount, 0);
            const dayIncome = items
              .filter((i) => i.kind === 'income')
              .reduce((a, b) => a + b.amount, 0);
            const dayNet = dayExpenses - dayIncome;
            return (
              <div key={date}>
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-2 bg-surface-raised/95 backdrop-blur border-b border-surface-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 capitalize">
                    {formatDateReadable(date, locale)}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    {fmt(dayNet)}
                  </span>
                </div>
                <ul>
                  {items.map((e) => {
                    const cat = e.categoryId ? catLookup[e.monthId]?.[e.categoryId] : undefined;
                    const rec = e.recurringId ? recurringById[e.recurringId] : undefined;
                    const isIncome = e.kind === 'income';
                    return (
                      <li
                        key={e.id}
                        className="group flex items-center gap-3 px-5 py-3 border-b border-surface-border/60 hover:bg-surface-overlay/40 transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: isIncome
                              ? '#22c55e'
                              : (cat?.color ?? '#666'),
                          }}
                          title={isIncome ? t('addExpense.kindIncome') : cat?.name}
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
                            {isIncome && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/25 flex-shrink-0">
                                <ArrowDownLeft size={9} />
                                {t('addExpense.kindIncome')}
                              </span>
                            )}
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
                          {(!isIncome || searchAll) && (
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              {!isIncome && (
                                <span>{cat?.name ?? t('expenseList.unknownCategory')}</span>
                              )}
                              {searchAll && (
                                <span className="text-slate-500 dark:text-slate-500">
                                  {!isIncome ? '· ' : ''}
                                  {formatMonthShort(e.monthId, locale)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div
                          className={`tabular-nums text-sm font-medium ${
                            isIncome ? 'text-emerald-500 dark:text-emerald-400' : ''
                          }`}
                        >
                          {isIncome ? '+' : ''}
                          {fmt(e.amount)}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {rec && (
                            <button
                              className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 row-action text-slate-500 hover:!text-amber-400"
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
                            className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 row-action text-slate-500 hover:!text-rose-400"
                            onClick={() => onDelete(e.id, e.monthId)}
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
