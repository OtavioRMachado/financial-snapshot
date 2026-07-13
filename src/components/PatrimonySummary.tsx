import { Plus, TrendingUp } from 'lucide-react';
import type { Asset, AssetEntry, CurrencyCode } from '../types';
import { formatCurrency } from '../utils';
import { computePatrimonyForecast } from '../storage';
import { useT, useLocale } from '../i18n';
import { getAssetIcon } from './assetIcons';
import PatrimonyProjectionChart from './PatrimonyProjectionChart';

interface Props {
  currency: CurrencyCode;
  conversionRates: Partial<Record<CurrencyCode, number>>;
  assets: Asset[];
  entries: AssetEntry[];
  activeAssetId: string | null;
  onSelectAsset: (id: string) => void;
  onAddAsset: () => void;
  /** Optional trailing action (e.g. FX refresh) shown in the card header. */
  headerAction?: React.ReactNode;
}

/** Return the amount in the asset's own currency AND converted into the app currency. */
function assetValues(asset: Asset, entries: AssetEntry[]): { native: number; count: number } {
  const filtered = entries.filter((e) => e.assetId === asset.id);
  if (filtered.length === 0) return { native: 0, count: 0 };
  if (asset.type === 'snapshot') {
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    return { native: sorted[sorted.length - 1].amount, count: filtered.length };
  }
  return {
    native: filtered.reduce((a, b) => a + b.amount, 0),
    count: filtered.length,
  };
}

export default function PatrimonySummary({
  currency,
  conversionRates,
  assets,
  entries,
  activeAssetId,
  onSelectAsset,
  onAddAsset,
  headerAction,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number, code: CurrencyCode = currency) =>
    formatCurrency(n, code, { locale });

  // Per-asset details for cards
  const perAsset = assets.map((a) => {
    const { native, count } = assetValues(a, entries);
    const rate = a.currency === currency ? 1 : conversionRates[a.currency] ?? 1;
    const inApp = native * rate;
    return { asset: a, native, inApp, count };
  });

  // Overall totals + projection
  const forecast = computePatrimonyForecast(assets, entries, currency, conversionRates);
  const total = forecast.currentTotal;

  return (
    <div className="card p-4 sm:p-6">
      {headerAction && (
        <div className="flex justify-end -mt-1 mb-2">{headerAction}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:flex-wrap gap-4 sm:gap-6 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
            {t('wealth.totalPatrimony')}
          </div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{fmt(total)}</div>
          {forecast.hasProjection && (
            <div className="text-xs text-slate-500 mt-1">{t('wealth.currentTotal')}</div>
          )}
        </div>

        {forecast.hasProjection && (
          <div className="sm:text-right">
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 sm:justify-end">
              <TrendingUp size={11} className="text-emerald-400" />
              {t('wealth.projectedIn', { years: forecast.horizonYears })}
            </div>
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-emerald-400">
              {fmt(forecast.projectedTotal)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('wealth.projectedGain', { gain: fmt(forecast.gain) })}
            </div>
          </div>
        )}
      </div>

      {forecast.hasProjection && (
        <p className="text-[11px] text-slate-500 mb-4 -mt-2">{t('wealth.projectedNote')}</p>
      )}

      {assets.length > 0 && entries.length > 0 && (
        <div className="mb-5 pb-5 border-b border-surface-border/60">
          <PatrimonyProjectionChart
            assets={assets}
            entries={entries}
            currency={currency}
            conversionRates={conversionRates}
          />
        </div>
      )}

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-8 px-6 text-center">
          <div className="text-slate-700 dark:text-slate-300 font-medium mb-1">{t('assets.emptyTitle')}</div>
          <div className="text-xs text-slate-500 mb-4">{t('assets.emptySubtitle')}</div>
          <button className="btn-primary" onClick={onAddAsset}>
            <Plus size={14} />
            {t('assets.addAsset')}
          </button>
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {perAsset.map(({ asset, native, inApp, count }) => {
            const pct = total > 0 ? (inApp / total) * 100 : 0;
            const isActive = asset.id === activeAssetId;
            const Icon = getAssetIcon(asset.icon);
            const hint =
              count === 0
                ? asset.type === 'snapshot'
                  ? t('wealth.card.noSnapshots')
                  : t('wealth.card.noVests')
                : asset.currency === currency
                  ? asset.type === 'snapshot'
                    ? t('wealth.card.snapshotCount', { n: count })
                    : t('wealth.card.entriesCount', { n: count })
                  : `${fmt(native, asset.currency)} · ${count}`;

            return (
              <div
                key={asset.id}
                className="snap-start flex-shrink-0 w-[80%] sm:w-auto sm:flex-shrink flex"
              >
                <button
                  onClick={() => onSelectAsset(asset.id)}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    isActive
                      ? 'bg-surface-overlay border-accent/50'
                      : 'bg-surface-overlay/40 border-surface-border hover:bg-surface-overlay/70'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: asset.color + '25', color: asset.color }}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="font-medium truncate">{asset.name}</span>
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{fmt(inApp)}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{hint}</span>
                    <span className="tabular-nums flex-shrink-0 ml-2">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-surface-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%`, backgroundColor: asset.color }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
          <div className="snap-start flex-shrink-0 w-[80%] sm:w-auto sm:flex-shrink flex">
            <button
              onClick={onAddAsset}
              className="w-full rounded-xl p-4 border border-dashed border-surface-border text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-accent/40 transition-colors flex flex-col items-center justify-center gap-1"
            >
              <Plus size={16} />
              <span className="text-xs font-medium">{t('assets.addAsset')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
