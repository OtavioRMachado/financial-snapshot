import { useMemo, useState } from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import type { CurrencyCode, Expense } from '../types';
import { CATEGORY_PALETTE, formatCurrency } from '../utils';
import { useT, useLocale } from '../i18n';

/**
 * A category slice input for the pie chart. Callers group expenses per category
 * externally so this component doesn't need to know about months / income.
 */
export interface CategorySliceInput {
  id: string;
  name: string;
  color: string;
  expenses: Expense[];
}

interface Props {
  slices: CategorySliceInput[];
  currency: CurrencyCode;
  title: string;
  subtitle?: string;
}

/** Anything rendered as a pie slice — either a category or a single expense. */
interface DisplaySlice {
  id: string;
  name: string;
  color: string;
  total: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, startAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

/** Full-ring donut when there's only one slice (100%). */
function fullRingPath(cx: number, cy: number, rOuter: number, rInner: number) {
  return (
    `M ${cx} ${cy - rOuter} ` +
    `A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.001} ${cy - rOuter} ` +
    `L ${cx - 0.001} ${cy - rInner} ` +
    `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner} Z`
  );
}

export default function CategoryPieChart({ slices, currency, title, subtitle }: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  // Per-slice totals (only expense-kind entries; income is excluded upstream too)
  const slicesWithTotal = useMemo(
    () =>
      slices
        .map((s) => ({
          ...s,
          total: s.expenses.reduce((a, b) => a + b.amount, 0),
        }))
        .filter((s) => s.total > 0)
        .sort((a, b) => b.total - a.total),
    [slices]
  );

  // Track which CATEGORIES are excluded. Chips always operate on categories.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const filtered = slicesWithTotal.filter((s) => !excluded.has(s.id));
  const grandTotal = slicesWithTotal.reduce((a, s) => a + s.total, 0);
  const totalIncluded = filtered.reduce((a, s) => a + s.total, 0);

  const [hoverId, setHoverId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAll = () => setExcluded(new Set());
  const clearAll = () => setExcluded(new Set(slicesWithTotal.map((s) => s.id)));

  // Detail mode: exactly one category → pie shows individual expenses within it,
  // merging entries with the same trimmed description into a single slice.
  const onlyCategory = filtered.length === 1 ? filtered[0] : null;
  const detailSlices: DisplaySlice[] = useMemo(() => {
    if (!onlyCategory) return [];
    const groups = new Map<string, { displayName: string; total: number; count: number }>();
    for (const e of onlyCategory.expenses) {
      if (e.amount <= 0) continue;
      const key = (e.description ?? '').trim();
      const displayName = key === '' ? t('expenseList.noDescription') : key;
      const existing = groups.get(key);
      if (existing) {
        existing.total += e.amount;
        existing.count += 1;
      } else {
        groups.set(key, { displayName, total: e.amount, count: 1 });
      }
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([key, g], i) => ({
        id: `group-${key || '__empty__'}`,
        name: g.count > 1 ? `${g.displayName} ×${g.count}` : g.displayName,
        // First slice keeps the category color as an anchor; subsequent slices cycle.
        color: i === 0 ? onlyCategory.color : CATEGORY_PALETTE[(i + 3) % CATEGORY_PALETTE.length],
        total: g.total,
      }));
  }, [onlyCategory, t]);

  const displaySlices: DisplaySlice[] = onlyCategory ? detailSlices : filtered;
  const displayTotal = onlyCategory ? onlyCategory.total : totalIncluded;

  // Compute slice paths
  const paths = useMemo(() => {
    if (displaySlices.length === 0 || displayTotal === 0) return [];
    const cx = 100;
    const cy = 100;
    const rOuter = 90;
    const rInner = 55;
    if (displaySlices.length === 1) {
      return [{ slice: displaySlices[0], d: fullRingPath(cx, cy, rOuter, rInner) }];
    }
    let angle = 0;
    return displaySlices.map((s) => {
      const sweep = (s.total / displayTotal) * 360;
      const d = slicePath(cx, cy, rOuter, rInner, angle, angle + sweep);
      angle += sweep;
      return { slice: s, d };
    });
  }, [displaySlices, displayTotal]);

  const hoveredSlice = hoverId ? displaySlices.find((s) => s.id === hoverId) : null;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <PieIcon size={16} className="text-accent" />
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {slicesWithTotal.length > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={selectAll}
              className="btn-ghost !py-1 !px-2"
              disabled={excluded.size === 0}
            >
              {t('pie.selectAll')}
            </button>
            <button
              onClick={clearAll}
              className="btn-ghost !py-1 !px-2"
              disabled={excluded.size === slicesWithTotal.length}
            >
              {t('pie.clearAll')}
            </button>
          </div>
        )}
      </div>

      {slicesWithTotal.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">{t('pie.empty')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] gap-6 items-start">
          {/* Chart */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                {t('pie.noSelection')}
              </div>
            ) : (
              <div className="relative w-full max-w-[220px] mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-auto">
                  {paths.map(({ slice, d }) => {
                    const isHover = hoverId === slice.id;
                    return (
                      <path
                        key={slice.id}
                        d={d}
                        fill={slice.color}
                        opacity={hoverId && !isHover ? 0.45 : 1}
                        onMouseEnter={() => setHoverId(slice.id)}
                        onMouseLeave={() => setHoverId(null)}
                        style={{ cursor: 'pointer', transition: 'opacity 150ms' }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
                  {hoveredSlice ? (
                    (() => {
                      const pct =
                        displayTotal > 0 ? (hoveredSlice.total / displayTotal) * 100 : 0;
                      return (
                        <>
                          <div className="text-[11px] text-slate-500 truncate max-w-[110px]">
                            {hoveredSlice.name}
                          </div>
                          <div className="text-lg font-semibold tabular-nums">
                            {pct.toFixed(0)}%
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            {fmt(hoveredSlice.total)}
                          </div>
                        </>
                      );
                    })()
                  ) : onlyCategory ? (
                    <>
                      <div className="text-[11px] text-slate-500 truncate max-w-[110px]">
                        {onlyCategory.name}
                      </div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmt(onlyCategory.total)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t('pie.entryCount', { n: detailSlices.length })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-500">{t('pie.total')}</div>
                      <div className="text-lg font-semibold tabular-nums">
                        {fmt(totalIncluded)}
                      </div>
                      {totalIncluded < grandTotal && (
                        <div className="text-[10px] text-slate-500">
                          {t('pie.ofTotal', { total: fmt(grandTotal) })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category filter chips (always at the category level) */}
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              {slicesWithTotal.map((s) => {
                const isOn = !excluded.has(s.id);
                // Included chips reflect their share of the *current* filtered pie so
                // they stay in sync when the user hides other categories.
                // Excluded chips fall back to their share of the grand total as a
                // reference for what they'd contribute if re-added.
                const denom = isOn ? totalIncluded : grandTotal;
                const pct = denom > 0 ? (s.total / denom) * 100 : 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    onMouseEnter={() => setHoverId(s.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border transition-colors ${
                      isOn
                        ? 'bg-surface-overlay border-surface-border text-slate-800 dark:text-slate-100'
                        : 'bg-transparent border-surface-border/60 text-slate-500 line-through opacity-60'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color, opacity: isOn ? 1 : 0.5 }}
                    />
                    <span className="truncate max-w-[140px]">{s.name}</span>
                    <span className="tabular-nums text-slate-500">{pct.toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
