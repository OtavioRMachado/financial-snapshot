import { useMemo } from 'react';
import type { Asset, AssetEntry, CurrencyCode } from '../types';
import {
  computePatrimonyHistoryPoints,
  computePatrimonyProjectionPoints,
} from '../storage';
import { useT } from '../i18n';
import InvestmentChart, { type ChartSeries } from './InvestmentChart';

interface Props {
  assets: Asset[];
  entries: AssetEntry[];
  currency: CurrencyCode;
  conversionRates: Partial<Record<CurrencyCode, number>>;
}

export default function PatrimonyProjectionChart({
  assets,
  entries,
  currency,
  conversionRates,
}: Props) {
  const t = useT();

  const historyPoints = useMemo(
    () => computePatrimonyHistoryPoints(assets, entries, currency, conversionRates),
    [assets, entries, currency, conversionRates]
  );
  const projectionPoints = useMemo(
    () => computePatrimonyProjectionPoints(assets, entries, currency, conversionRates),
    [assets, entries, currency, conversionRates]
  );

  if (historyPoints.length === 0 && projectionPoints.length === 0) return null;

  const series: ChartSeries[] = [];
  if (historyPoints.length > 0) {
    series.push({
      key: 'actual',
      label: t('chart.actual'),
      color: '#7c5cff',
      showDots: false,
      points: historyPoints,
    });
  }
  if (projectionPoints.length > 0) {
    series.push({
      key: 'projection',
      label: t('chart.projection'),
      color: '#22c55e',
      dashed: true,
      showDots: false,
      points: projectionPoints,
    });
  }

  return <InvestmentChart series={series} currency={currency} height={220} />;
}
