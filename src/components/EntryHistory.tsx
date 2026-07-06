import { Trash2 } from 'lucide-react';
import type { CurrencyCode } from '../types';
import { formatCurrency, formatDateFull, parseISODate } from '../utils';
import { useT, useLocale } from '../i18n';

interface Entry {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

interface Props {
  entries: Entry[];
  currency: CurrencyCode;
  displayCurrency?: CurrencyCode;
  title: string;
  emptyMessage: string;
  showDelta?: boolean;
  showCumulative?: boolean;
  onDelete: (id: string) => void;
}

export default function EntryHistory({
  entries,
  currency,
  displayCurrency,
  title,
  emptyMessage,
  showDelta = false,
  showCumulative = false,
  onDelete,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const displayCode = displayCurrency ?? currency;
  const fmt = (n: number) => formatCurrency(n, displayCode, { locale });

  const asc = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const cumulativeById: Record<string, number> = {};
  let running = 0;
  for (const e of asc) {
    running += e.amount;
    cumulativeById[e.id] = running;
  }
  const desc = [...asc].reverse();

  return (
    <div className="card">
      <div className="p-5 pb-3 border-b border-surface-border flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {title}
          <span className="chip !py-0.5 !px-2">{entries.length}</span>
        </h3>
        <span className="text-xs text-slate-500">{t('entryHistory.mostRecentFirst')}</span>
      </div>
      {entries.length === 0 ? (
        <div className="p-8 text-center text-slate-600 dark:text-slate-400 text-sm">{emptyMessage}</div>
      ) : (
        <ul className="max-h-[420px] overflow-y-auto">
          {desc.map((e, idx) => {
            const prev = desc[idx + 1];
            const delta = prev ? e.amount - prev.amount : null;
            return (
              <li
                key={e.id}
                className="group flex items-center gap-4 px-5 py-3 border-b border-surface-border/60 last:border-b-0 hover:bg-surface-overlay/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{formatDateFull(parseISODate(e.date), locale)}</div>
                  <div className="text-xs mt-0.5 text-slate-500 flex items-center gap-2 flex-wrap">
                    {e.note && <span className="truncate">{e.note}</span>}
                    {showDelta && delta !== null && (
                      <span
                        className={`tabular-nums ${
                          delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t('entryHistory.deltaVsPrev', {
                          delta: (delta >= 0 ? '+' : '') + fmt(delta),
                        })}
                      </span>
                    )}
                    {showCumulative && (
                      <span className="tabular-nums text-slate-600 dark:text-slate-400">
                        {t('entryHistory.totalAfter', { total: fmt(cumulativeById[e.id]) })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium tabular-nums">{fmt(e.amount)}</div>
                <button
                  className="btn-ghost !p-1.5 opacity-0 group-hover:opacity-100 row-action text-slate-500 hover:!text-rose-400"
                  onClick={() => onDelete(e.id)}
                  aria-label={t('entryForm.deleteAria')}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
