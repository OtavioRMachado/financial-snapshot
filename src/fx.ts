import type { CurrencyCode } from './types';

/**
 * Fetch live exchange rates from frankfurter.dev (free, no API key, sourced
 * from the European Central Bank). Returns a partial map of "app currency
 * units per 1 unit of `X`" for each currency in `otherCurrencies`.
 *
 * If the appCurrency is not supported by frankfurter (rare — BRL is; USD, EUR,
 * GBP, JPY, etc.), an error is thrown.
 */
export async function fetchLiveRates(
  appCurrency: CurrencyCode,
  otherCurrencies: CurrencyCode[]
): Promise<Partial<Record<CurrencyCode, number>>> {
  const symbols = otherCurrencies.filter((c) => c !== appCurrency);
  if (symbols.length === 0) return {};

  const url = new URL('https://api.frankfurter.dev/v1/latest');
  url.searchParams.set('base', appCurrency);
  url.searchParams.set('symbols', symbols.join(','));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`FX fetch failed: HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    base?: string;
    rates?: Partial<Record<CurrencyCode, number>>;
  };
  if (!data.rates) throw new Error('FX fetch returned no rates');

  // API returns "1 appCurrency = X unit of `symbol`". We want the inverse:
  // "app currency units per 1 unit of X".
  const inverted: Partial<Record<CurrencyCode, number>> = {};
  for (const [code, rate] of Object.entries(data.rates)) {
    if (typeof rate === 'number' && rate > 0) {
      inverted[code as CurrencyCode] = 1 / rate;
    }
  }
  return inverted;
}
