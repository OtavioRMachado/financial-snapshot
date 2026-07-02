import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, CornerDownLeft, Repeat, Infinity as InfinityIcon } from 'lucide-react';
import type { CurrencyCode, Expense, Month } from '../types';
import { currencySymbol, todayISO, uid } from '../utils';
import { useT } from '../i18n';

export interface RecurringMeta {
  duration: number | 'indefinite';
}

interface Props {
  month: Month;
  currency: CurrencyCode;
  onAdd: (expense: Expense, recurring?: RecurringMeta) => void;
  recentCategoryIds: string[];
}

export default function AddExpenseForm({ month, currency, onAdd, recentCategoryIds }: Props) {
  const t = useT();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>(
    () => recentCategoryIds[0] ?? month.categories[0]?.id ?? ''
  );
  const [date, setDate] = useState(todayISO());
  const [recurring, setRecurring] = useState(false);
  const [indefinite, setIndefinite] = useState(false);
  const [monthsStr, setMonthsStr] = useState('3');
  const amountRef = useRef<HTMLInputElement>(null);

  const sortedCategories = useMemo(() => {
    const seen = new Set<string>();
    const ordered = [];
    for (const rid of recentCategoryIds) {
      const c = month.categories.find((x) => x.id === rid);
      if (c && !seen.has(c.id)) {
        seen.add(c.id);
        ordered.push(c);
      }
    }
    for (const c of month.categories) {
      if (!seen.has(c.id)) ordered.push(c);
    }
    return ordered;
  }, [month.categories, recentCategoryIds]);

  useEffect(() => {
    if (!month.categories.some((c) => c.id === categoryId)) {
      setCategoryId(sortedCategories[0]?.id ?? '');
    }
  }, [month.categories, categoryId, sortedCategories]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        amountRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const parsedMonths = Math.max(1, Math.floor(Number.parseFloat(monthsStr) || 0));
  const monthsValid = indefinite || parsedMonths >= 1;
  const canSubmit = parsedAmount > 0 && categoryId && date && (!recurring || monthsValid);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    const expense: Expense = {
      id: uid(),
      amount: Math.round(parsedAmount * 100) / 100,
      description: description.trim(),
      categoryId,
      date,
      createdAt: Date.now(),
    };

    const recurringMeta: RecurringMeta | undefined = recurring
      ? { duration: indefinite ? 'indefinite' : parsedMonths }
      : undefined;

    onAdd(expense, recurringMeta);
    setAmount('');
    setDescription('');
    amountRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Plus size={16} className="text-accent" />
          {t('addExpense.title')}
        </h3>
        <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
          {t('addExpense.focusPrefix')}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-overlay border border-surface-border text-slate-700 dark:text-slate-300">
            N
          </kbd>
          {t('addExpense.focusSuffix')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,150px)_minmax(0,1fr)_minmax(0,180px)_minmax(0,150px)_auto] gap-3 items-end">
        <div>
          <label className="label" htmlFor="expense-amount">
            {t('common.amount')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
              {currencySymbol(currency)}
            </span>
            <input
              id="expense-amount"
              ref={amountRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="input pl-7 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="expense-desc">
            {t('common.description')}
          </label>
          <input
            id="expense-desc"
            type="text"
            placeholder={t('addExpense.descPlaceholder')}
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="label" htmlFor="expense-cat">
            {t('common.category')}
          </label>
          <select
            id="expense-cat"
            className="input appearance-none pr-8"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {sortedCategories.length === 0 && (
              <option value="">{t('addExpense.noCategories')}</option>
            )}
            {sortedCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="expense-date">
            {t('common.date')}
          </label>
          <input
            id="expense-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary h-[38px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('addExpense.submit')}
          <CornerDownLeft size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-surface-border/60">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
          <span className="w-9 h-5 rounded-full bg-surface-overlay border border-surface-border relative transition-colors peer-checked:bg-accent peer-checked:border-accent">
            <span className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </span>
          <Repeat size={14} className={recurring ? 'text-accent' : 'text-slate-500'} />
          {t('addExpense.repeatMonthly')}
        </label>

        {recurring && (
          <div className="flex items-center gap-3 flex-wrap animate-fade-in">
            <div
              className={`inline-flex items-center gap-2 text-sm ${
                indefinite ? 'opacity-40' : ''
              }`}
            >
              <span className="text-slate-600 dark:text-slate-400">{t('addExpense.for')}</span>
              <input
                type="number"
                min="1"
                step="1"
                className="input !py-1 !px-2 w-16 text-center tabular-nums"
                value={monthsStr}
                onChange={(e) => setMonthsStr(e.target.value)}
                disabled={indefinite}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {parsedMonths === 1 ? t('common.month') : t('common.months')}{' '}
                <span className="text-slate-400 dark:text-slate-600">{t('addExpense.monthsInclThis')}</span>
              </span>
            </div>

            <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={indefinite}
                onChange={(e) => setIndefinite(e.target.checked)}
                className="accent-accent"
              />
              <InfinityIcon size={14} className={indefinite ? 'text-accent' : 'text-slate-500'} />
              {t('addExpense.indefinitely')}
            </label>
          </div>
        )}
      </div>
    </form>
  );
}
