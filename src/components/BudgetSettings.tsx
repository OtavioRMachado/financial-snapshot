import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, ArrowRightCircle } from 'lucide-react';
import type { Category, CurrencyCode, Month } from '../types';
import { CATEGORY_PALETTE, currencySymbol, formatCurrency, sum, uid } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  month: Month;
  currency: CurrencyCode;
  futureMonthCount: number;
  onSave: (patch: {
    salary: number;
    categories: Category[];
    applyToFuture: boolean;
  }) => void;
  onClose: () => void;
}

interface Draft {
  salary: string;
  categories: Array<Category & { budgetStr: string }>;
}

export default function BudgetSettings({
  month,
  currency,
  futureMonthCount,
  onSave,
  onClose,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const [draft, setDraft] = useState<Draft>(() => ({
    salary: String(month.salary),
    categories: month.categories.map((c) => ({ ...c, budgetStr: String(c.budget) })),
  }));
  const [applyToFuture, setApplyToFuture] = useState(false);

  useEffect(() => {
    setDraft({
      salary: String(month.salary),
      categories: month.categories.map((c) => ({ ...c, budgetStr: String(c.budget) })),
    });
    setApplyToFuture(false);
  }, [month.id, month.salary, month.categories]);

  const setCat = (id: string, patch: Partial<Category & { budgetStr: string }>) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const addCategory = () => {
    const usedColors = new Set(draft.categories.map((c) => c.color));
    const nextColor =
      CATEGORY_PALETTE.find((c) => !usedColors.has(c)) ??
      CATEGORY_PALETTE[draft.categories.length % CATEGORY_PALETTE.length];
    setDraft((d) => ({
      ...d,
      categories: [
        ...d.categories,
        {
          id: uid(),
          name: t('budgetSettings.newCategoryName'),
          budget: 0,
          color: nextColor,
          budgetStr: '0',
        },
      ],
    }));
  };

  const removeCategory = (id: string) => {
    setDraft((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));
  };

  const parsedSalary = Number.parseFloat(draft.salary.replace(',', '.')) || 0;
  const parsedCategories: Category[] = useMemo(
    () =>
      draft.categories.map((c) => ({
        id: c.id,
        name: c.name.trim() || 'Untitled',
        budget: Math.max(0, Number.parseFloat(c.budgetStr.replace(',', '.')) || 0),
        color: c.color,
      })),
    [draft.categories]
  );

  const totalBudget = sum(parsedCategories.map((c) => c.budget));
  const overAllocated = totalBudget > parsedSalary && parsedSalary > 0;
  const monthWord = (n: number) => (n === 1 ? t('common.month') : t('common.months'));

  return (
    <div>
      <div className="space-y-5">
        <div>
          <label className="label">{t('budgetSettings.monthlySalary')}</label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
              {currencySymbol(currency)}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="input pl-7 tabular-nums text-base"
              value={draft.salary}
              onChange={(e) => setDraft((d) => ({ ...d, salary: e.target.value }))}
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{t('budgetSettings.salaryHint')}</p>
        </div>

        <div className="divider" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label !mb-0">{t('budgetSettings.categoriesTitle')}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span
                  className={`tabular-nums ${
                    overAllocated ? 'text-amber-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t('budgetSettings.allocated', {
                    amount: fmt(totalBudget),
                    of: fmt(parsedSalary),
                  })}
                </span>
                {overAllocated && (
                  <span className="text-amber-400 ml-2">
                    {t('budgetSettings.overAllocated', {
                      amount: fmt(totalBudget - parsedSalary),
                    })}
                  </span>
                )}
              </p>
            </div>
            <button type="button" onClick={addCategory} className="btn-secondary text-xs">
              <Plus size={14} />
              {t('budgetSettings.addCategory')}
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {draft.categories.length === 0 ? (
              <div className="text-sm text-slate-600 dark:text-slate-400 py-6 text-center border border-dashed border-surface-border rounded-xl">
                {t('budgetSettings.noCategories')}
              </div>
            ) : (
              draft.categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 bg-surface-overlay/40 border border-surface-border rounded-xl p-2"
                >
                  <ColorPicker
                    color={c.color}
                    onChange={(color) => setCat(c.id, { color })}
                    ariaLabel={t('budgetSettings.changeColorAria')}
                  />
                  <input
                    className="input flex-1 !py-1.5"
                    value={c.name}
                    onChange={(e) => setCat(c.id, { name: e.target.value })}
                    placeholder={t('budgetSettings.categoryNamePlaceholder')}
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
                      {currencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      className="input pl-7 !py-1.5 tabular-nums"
                      value={c.budgetStr}
                      onChange={(e) => setCat(c.id, { budgetStr: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-ghost !p-1.5 text-slate-500 hover:!text-rose-400"
                    onClick={() => removeCategory(c.id)}
                    aria-label={t('budgetSettings.removeCategoryAria')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        <label
          className={`inline-flex items-start gap-2.5 text-sm select-none max-w-md ${
            futureMonthCount === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 accent-accent"
            checked={applyToFuture}
            disabled={futureMonthCount === 0}
            onChange={(e) => setApplyToFuture(e.target.checked)}
          />
          <span>
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
              <ArrowRightCircle size={14} className="text-accent" />
              {t('budgetSettings.applyToFuture')}
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              {futureMonthCount === 0
                ? t('budgetSettings.applyToFutureHintNone')
                : t('budgetSettings.applyToFutureHintWith', {
                    count: futureMonthCount,
                    monthWord: monthWord(futureMonthCount),
                  })}
            </span>
          </span>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <button className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSave({
                salary: parsedSalary,
                categories: parsedCategories,
                applyToFuture,
              });
            }}
          >
            {t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  color,
  onChange,
  ariaLabel,
}: {
  color: string;
  onChange: (c: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-lg border border-surface-border flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-label={ariaLabel}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 p-2 grid grid-cols-6 gap-1.5 bg-surface-raised border border-surface-border rounded-xl shadow-soft">
            {CATEGORY_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`w-6 h-6 rounded-md border ${
                  c === color ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
