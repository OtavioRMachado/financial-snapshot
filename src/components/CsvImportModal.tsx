import { useMemo, useRef, useState } from 'react';
import { Upload, Info, FileText } from 'lucide-react';
import type { Category, CurrencyCode, EntryKind, Expense, Month } from '../types';
import { formatCurrency, uid } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  currentMonth: Month;
  currency: CurrencyCode;
  onImport: (targetMonthId: string, expenses: Expense[]) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

interface ParsedRow {
  date: string;
  amount: number;
  description: string;
  categoryName: string;
  kind: EntryKind;
  raw: string;
}

/** Very small CSV parser. Supports quoted fields with commas and escaped quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        cur.push(field);
        field = '';
      } else if (ch === '\n') {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = '';
      } else if (ch === '\r') {
        // ignore
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // DD/MM/YYYY or MM/DD/YYYY — ambiguous, but assume DD/MM/YYYY (common in EU/BR)
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // DD-MM-YYYY
  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, d, m, y] = dashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

function normalizeAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  // Handle European format "1.234,56" -> "1234.56"
  let normalized = cleaned;
  if (/,\d{1,2}$/.test(cleaned) && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/,\d{1,2}$/.test(cleaned)) {
    normalized = cleaned.replace(',', '.');
  }
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export default function CsvImportModal({
  currentMonth,
  currency,
  onImport,
  onClose,
  onToast,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawRows, setRawRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>(
    () => currentMonth.categories[0]?.id ?? ''
  );

  const catByName: Record<string, Category> = useMemo(() => {
    const m: Record<string, Category> = {};
    for (const c of currentMonth.categories) m[c.name.toLowerCase()] = c;
    return m;
  }, [currentMonth.categories]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setError(t('csv.errorEmpty'));
          return;
        }

        // Skip header row if the first cell isn't a valid date/amount
        const firstDate = normalizeDate(rows[0][0] ?? '');
        const dataRows = firstDate === null ? rows.slice(1) : rows;

        const parsed: ParsedRow[] = [];
        for (const row of dataRows) {
          const [dateCol = '', amountCol = '', descCol = '', catCol = ''] = row;
          const date = normalizeDate(dateCol);
          const amount = normalizeAmount(amountCol);
          if (!date || amount === null) continue;
          parsed.push({
            date,
            amount: Math.abs(amount),
            description: descCol.trim(),
            categoryName: catCol.trim(),
            kind: amount < 0 ? 'income' : 'expense',
            raw: row.join(', '),
          });
        }

        if (parsed.length === 0) {
          setError(t('csv.errorNoValid'));
          return;
        }

        setRawRows(parsed);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(t('csv.errorParse'));
      }
    };
    reader.onerror = () => setError(t('csv.errorRead'));
    reader.readAsText(file);
  };

  // Group parsed rows by target month
  const byMonth = useMemo(() => {
    const g: Record<string, ParsedRow[]> = {};
    for (const r of rawRows) {
      const key = r.date.slice(0, 7);
      if (!g[key]) g[key] = [];
      g[key].push(r);
    }
    return g;
  }, [rawRows]);

  const importAll = () => {
    if (rawRows.length === 0) return;
    let totalImported = 0;
    for (const [monthKey, rows] of Object.entries(byMonth)) {
      const expenses: Expense[] = rows.map((r) => {
        const matched = catByName[r.categoryName.toLowerCase()];
        return {
          id: uid(),
          // Income entries are uncategorized; expenses fall back to the default.
          categoryId: r.kind === 'income' ? undefined : matched?.id ?? defaultCategoryId,
          amount: r.amount,
          description: r.description,
          date: r.date,
          createdAt: Date.now(),
          kind: r.kind,
        };
      });
      onImport(monthKey, expenses);
      totalImported += expenses.length;
    }
    onToast(t('csv.imported', { n: totalImported }));
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
        <Info size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
        <div className="space-y-1">
          <p>{t('csv.instructions')}</p>
          <p className="text-slate-500 text-[11px]">{t('csv.formatNote')}</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {rawRows.length === 0 ? (
        <button
          className="btn-secondary w-full justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText size={14} />
          {t('csv.chooseFile')}
        </button>
      ) : (
        <>
          <div className="rounded-xl border border-surface-border overflow-hidden">
            <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-500 bg-surface-overlay/40 border-b border-surface-border font-medium">
              {t('csv.previewTitle', { n: rawRows.length })}
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-surface-border/60">
              {rawRows.slice(0, 100).map((r, i) => {
                const matched = catByName[r.categoryName.toLowerCase()];
                return (
                  <div key={i} className="px-3 py-2 text-sm flex items-center gap-3">
                    <div className="text-xs text-slate-500 tabular-nums w-24 flex-shrink-0">
                      {r.date}
                    </div>
                    <div className="flex-1 min-w-0 truncate">
                      {r.description || (
                        <span className="text-slate-500 italic">{t('expenseList.noDescription')}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex-shrink-0 max-w-[100px] truncate">
                      {r.kind === 'income' ? (
                        <span className="text-emerald-500 dark:text-emerald-400 italic">
                          {t('addExpense.kindIncome')}
                        </span>
                      ) : matched ? (
                        <span className="text-emerald-500 dark:text-emerald-400">
                          {matched.name}
                        </span>
                      ) : r.categoryName ? (
                        <span className="text-amber-500 dark:text-amber-400 italic">
                          {r.categoryName}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </div>
                    <div
                      className={`text-sm tabular-nums font-medium flex-shrink-0 w-24 text-right ${
                        r.kind === 'income'
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : ''
                      }`}
                    >
                      {r.kind === 'income' ? '+' : ''}
                      {fmt(r.amount)}
                    </div>
                  </div>
                );
              })}
              {rawRows.length > 100 && (
                <div className="px-3 py-2 text-xs text-slate-500 text-center">
                  {t('csv.andMore', { n: rawRows.length - 100 })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">{t('csv.defaultCategory')}</label>
            <select
              className="input appearance-none"
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
            >
              {currentMonth.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1.5">{t('csv.defaultCategoryHint')}</p>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button className="btn-secondary" onClick={onClose}>
          {t('common.cancel')}
        </button>
        {rawRows.length > 0 && (
          <button className="btn-primary" onClick={importAll}>
            <Upload size={14} />
            {t('csv.importCount', { n: rawRows.length })}
          </button>
        )}
      </div>
    </div>
  );
}
