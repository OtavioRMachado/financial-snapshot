import { useState, type ReactNode } from 'react';
import { Plus, CornerDownLeft } from 'lucide-react';
import type { CurrencyCode } from '../types';
import { currencySymbol, todayISO } from '../utils';
import { useT } from '../i18n';

interface Props {
  currency: CurrencyCode;
  /** Optional override to display a different currency symbol on the amount input (e.g. USD for RSUs). Storage/typing is unchanged. */
  displayCurrency?: CurrencyCode;
  title: string;
  amountLabel?: string;
  submitLabel?: string;
  includeNote?: boolean;
  hint?: ReactNode;
  onAdd: (entry: { date: string; amount: number; note?: string }) => void;
}

export default function AddEntryForm({
  currency,
  displayCurrency,
  title,
  amountLabel,
  submitLabel,
  includeNote = false,
  hint,
  onAdd,
}: Props) {
  const t = useT();
  const symbolCurrency = displayCurrency ?? currency;
  const finalAmountLabel = amountLabel ?? t('common.amount');
  const finalSubmitLabel = submitLabel ?? t('common.save');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const canSubmit = parsedAmount > 0 && !!date;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onAdd({
      date,
      amount: Math.round(parsedAmount * 100) / 100,
      note: includeNote && note.trim() ? note.trim() : undefined,
    });
    setAmount('');
    setNote('');
    // Keep date for quick successive entries.
  };

  return (
    <form onSubmit={submit} className="card p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Plus size={16} className="text-accent" />
          {title}
        </h3>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      <div
        className={`grid grid-cols-1 gap-3 items-end ${
          includeNote
            ? 'md:grid-cols-[minmax(0,180px)_minmax(0,180px)_minmax(0,1fr)_auto]'
            : 'md:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto]'
        }`}
      >
        <div>
          <label className="label">{finalAmountLabel}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
              {currencySymbol(symbolCurrency)}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="input pl-7 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <label className="label">{t('common.date')}</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {includeNote && (
          <div>
            <label className="label">
              {t('common.description')} {t('common.optional')}
            </label>
            <input
              type="text"
              className="input"
              placeholder=""
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary h-[38px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {finalSubmitLabel}
          <CornerDownLeft size={14} />
        </button>
      </div>
    </form>
  );
}
