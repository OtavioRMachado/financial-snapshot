import { useMemo } from 'react';
import { ArrowLeftRight, Settings as SettingsIcon } from 'lucide-react';
import type {
  Asset,
  AssetEntry,
  CurrencyCode,
} from '../types';
import {
  addMonths,
  formatCurrency,
  formatDateFull,
  parseISODate,
  uid,
} from '../utils';
import InvestmentChart, {
  type ChartPoint,
  type ChartSeries,
} from './InvestmentChart';
import AddEntryForm from './AddEntryForm';
import EntryHistory from './EntryHistory';
import { useT, useLocale } from '../i18n';
import { getAssetIcon } from './assetIcons';

interface Props {
  asset: Asset;
  entries: AssetEntry[];
  appCurrency: CurrencyCode;
  /** Units of app currency per 1 unit of the asset's currency. Ignored when asset.currency === appCurrency. */
  conversionRate: number;
  onAddEntry: (entry: AssetEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateConversionRate: (currency: CurrencyCode, rate: number) => void;
  onOpenSettings: () => void;
}

export default function AssetSection({
  asset,
  entries,
  appCurrency,
  conversionRate,
  onAddEntry,
  onDeleteEntry,
  onUpdateConversionRate,
  onOpenSettings,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const Icon = getAssetIcon(asset.icon);

  const isForeign = asset.currency !== appCurrency;
  const effectiveRate = isForeign ? conversionRate : 1;
  const fmtAsset = (n: number) => formatCurrency(n, asset.currency, { locale });
  const fmtApp = (n: number) => formatCurrency(n, appCurrency, { locale });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );

  interface AssetSummary {
    currentValue: number;
    currentValueInApp: number;
    currentDate: Date | null;
    firstDate: Date | null;
    change: number;
    projectedValue?: number;
    projectedGain?: number;
    avg?: number;
    count?: number;
  }

  const { chartSeries, summary } = useMemo<{
    chartSeries: ChartSeries[];
    summary: AssetSummary | null;
  }>(() => {
    if (asset.type === 'snapshot') {
      const actualPoints: ChartPoint[] = sorted.map((e) => ({
        date: parseISODate(e.date),
        value: e.amount,
      }));

      let projectionPoints: ChartPoint[] = [];
      let summary: AssetSummary | null = null;

      const last = actualPoints[actualPoints.length - 1];
      const first = actualPoints[0];

      if (last) {
        summary = {
          currentValue: last.value,
          currentValueInApp: last.value * effectiveRate,
          currentDate: last.date,
          firstDate: first !== last ? first.date : null,
          change: first !== last ? last.value - first.value : 0,
        };

        if (asset.projection?.enabled) {
          const months = Math.max(1, Math.round(asset.projection.years * 12));
          const monthlyRate = Math.pow(1 + asset.projection.annualReturnRate, 1 / 12) - 1;
          let value = last.value;
          projectionPoints = [{ date: last.date, value }];
          for (let i = 1; i <= months; i++) {
            value = value * (1 + monthlyRate) + asset.projection.monthlyContribution;
            projectionPoints.push({ date: addMonths(last.date, i), value });
          }
          summary.projectedValue = projectionPoints[projectionPoints.length - 1].value;
          summary.projectedGain = summary.projectedValue - last.value;
        }
      }

      const series: ChartSeries[] = [
        {
          key: 'actual',
          label: t('chart.actual'),
          color: asset.color,
          showDots: true,
          points: actualPoints,
        },
      ];
      if (projectionPoints.length > 0) {
        series.push({
          key: 'projection',
          label: t('chart.projection'),
          color: '#22c55e',
          dashed: true,
          points: projectionPoints,
        });
      }

      return { chartSeries: series, summary };
    }

    // Cumulative
    const cumPoints: ChartPoint[] = [];
    let running = 0;
    for (const e of sorted) {
      running += e.amount;
      cumPoints.push({ date: parseISODate(e.date), value: running });
    }
    const total = running;
    const avg = entries.length > 0 ? total / entries.length : 0;
    const last = sorted[sorted.length - 1];

    const summary: AssetSummary | null = last
      ? {
          currentValue: total,
          currentValueInApp: total * effectiveRate,
          currentDate: parseISODate(last.date),
          firstDate: null,
          change: 0,
          avg,
          count: entries.length,
        }
      : null;

    return {
      chartSeries: [
        {
          key: 'cumulative',
          label: t('chart.cumulative'),
          color: asset.color,
          showDots: true,
          points: cumPoints,
        } as ChartSeries,
      ],
      summary,
    };
  }, [asset, sorted, entries.length, effectiveRate, t]);

  const isSnapshot = asset.type === 'snapshot';

  return (
    <div className="space-y-6">
      {/* Header: asset name + settings */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: asset.color + '25', color: asset.color }}
          >
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold tracking-tight truncate">{asset.name}</div>
            <div className="text-xs text-slate-500">
              {asset.currency} ·{' '}
              {isSnapshot ? t('assets.type.snapshot') : t('assets.type.cumulative')}
            </div>
          </div>
        </div>
        <button className="btn-secondary !py-1.5" onClick={onOpenSettings}>
          <SettingsIcon size={14} />
          {t('assets.editAsset')}
        </button>
      </div>

      {/* Foreign currency rate control */}
      {isForeign && (
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <ArrowLeftRight size={15} className="text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">
              {t('assets.rate.header', { from: asset.currency, to: appCurrency })}
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                1 {asset.currency} =
              </span>
              <input
                type="number"
                step="0.0001"
                min="0"
                className="input !py-1 !pl-16 !pr-2 w-44 text-sm tabular-nums"
                value={conversionRate}
                onChange={(e) => {
                  const v = Number.parseFloat(e.target.value.replace(',', '.'));
                  if (Number.isFinite(v) && v > 0) onUpdateConversionRate(asset.currency, v);
                }}
              />
            </div>
            <span className="text-slate-500 text-xs">{appCurrency}</span>
          </div>
          <p className="text-xs text-slate-500">
            {t('assets.rate.note', {
              name: asset.name,
              currency: asset.currency,
              app: appCurrency,
            })}
          </p>
        </div>
      )}

      {/* Summary + chart */}
      <div className="card p-6">
        {summary ? (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
                {isSnapshot ? t('assets.section.currentValue') : t('assets.section.totalRecorded')}
              </div>
              <div className="text-3xl font-semibold tracking-tight mt-1">
                {fmtAsset(summary.currentValue)}
              </div>
              {isForeign && (
                <div className="text-xs text-slate-500 mt-1">
                  {t('assets.rate.approxConverted', {
                    converted: fmtApp(summary.currentValueInApp),
                    rate: conversionRate.toFixed(4),
                    from: asset.currency,
                    to: appCurrency,
                  })}
                </div>
              )}
              {summary.currentDate && (
                <div className="text-xs text-slate-500 mt-1">
                  {t('assets.section.asOf', {
                    date: formatDateFull(summary.currentDate, locale),
                  })}
                </div>
              )}
              {!isSnapshot && summary.count !== undefined && (
                <div className="text-xs text-slate-500 mt-1">
                  {t('assets.section.entriesCount', {
                    n: summary.count,
                    avg: fmtAsset(summary.avg ?? 0),
                  })}
                </div>
              )}
            </div>

            {isSnapshot && summary.projectedValue !== undefined && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
                  {t('assets.section.projectedIn', { years: asset.projection!.years })}
                </div>
                <div className="text-3xl font-semibold tracking-tight mt-1 text-emerald-400">
                  {fmtAsset(summary.projectedValue)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {asset.projection!.monthlyContribution > 0
                    ? t('assets.section.projectedHintContrib', {
                        gain: fmtAsset(summary.projectedGain ?? 0),
                        rate: (asset.projection!.annualReturnRate * 100).toFixed(1),
                        contrib: fmtAsset(asset.projection!.monthlyContribution),
                      })
                    : t('assets.section.projectedHint', {
                        gain: fmtAsset(summary.projectedGain ?? 0),
                        rate: (asset.projection!.annualReturnRate * 100).toFixed(1),
                      })}
                </div>
              </div>
            )}

            {isSnapshot && summary.firstDate && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium">
                  {t('assets.section.sinceFirst')}
                </div>
                <div
                  className={`text-3xl font-semibold tracking-tight mt-1 ${
                    summary.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {summary.change >= 0 ? '+' : ''}
                  {fmtAsset(summary.change)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('assets.section.from', {
                    date: formatDateFull(summary.firstDate, locale),
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-500">
              {fmtAsset(0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">{t('assets.section.emptyHint')}</div>
          </div>
        )}
        <InvestmentChart series={chartSeries} currency={asset.currency} height={320} />
      </div>

      <AddEntryForm
        currency={appCurrency}
        displayCurrency={asset.currency}
        title={isSnapshot ? t('assets.form.snapshot.title') : t('assets.form.cumulative.title')}
        amountLabel={
          isSnapshot ? t('assets.form.snapshot.amount') : t('assets.form.cumulative.amount')
        }
        submitLabel={
          isSnapshot ? t('assets.form.snapshot.submit') : t('assets.form.cumulative.submit')
        }
        includeNote={!isSnapshot}
        hint={
          isSnapshot
            ? t('assets.form.snapshot.hint', { name: asset.name })
            : t('assets.form.cumulative.hint', { name: asset.name })
        }
        onAdd={({ date, amount, note }) =>
          onAddEntry({ id: uid(), assetId: asset.id, date, amount, note })
        }
      />

      <EntryHistory
        entries={entries}
        currency={appCurrency}
        displayCurrency={asset.currency}
        title={isSnapshot ? t('assets.history.snapshot') : t('assets.history.cumulative')}
        emptyMessage={t('assets.history.empty')}
        showDelta={isSnapshot}
        showCumulative={!isSnapshot}
        onDelete={onDeleteEntry}
      />
    </div>
  );
}
