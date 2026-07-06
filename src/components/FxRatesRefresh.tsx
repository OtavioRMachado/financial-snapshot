import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { CurrencyCode } from '../types';
import { fetchLiveRates } from '../fx';
import { useT, useLocale } from '../i18n';

interface Props {
  appCurrency: CurrencyCode;
  neededCurrencies: CurrencyCode[];
  fxRatesUpdatedAt: string | undefined;
  onUpdate: (rates: Partial<Record<CurrencyCode, number>>) => void;
  onToast: (msg: string) => void;
}

export default function FxRatesRefresh({
  appCurrency,
  neededCurrencies,
  fxRatesUpdatedAt,
  onUpdate,
  onToast,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const foreignCurrencies = neededCurrencies.filter((c) => c !== appCurrency);
  if (foreignCurrencies.length === 0) return null;

  const refresh = async () => {
    setLoading(true);
    try {
      const rates = await fetchLiveRates(appCurrency, foreignCurrencies);
      if (Object.keys(rates).length === 0) {
        onToast(t('fx.errorNoData'));
        return;
      }
      onUpdate(rates);
      onToast(t('fx.updated'));
    } catch (err) {
      console.error('FX fetch failed', err);
      onToast(t('fx.error'));
    } finally {
      setLoading(false);
    }
  };

  const lastUpdated = fxRatesUpdatedAt
    ? new Date(fxRatesUpdatedAt).toLocaleString(locale, {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
      })
    : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={refresh}
        disabled={loading}
        className="btn-ghost !py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        {loading ? t('fx.updating') : t('fx.refresh')}
      </button>
      {lastUpdated && (
        <span className="text-[11px] text-slate-500">
          {t('fx.lastUpdated', { when: lastUpdated })}
        </span>
      )}
    </div>
  );
}
