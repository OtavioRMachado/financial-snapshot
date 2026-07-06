import { useEffect, useMemo, useState } from 'react';
import { Trash2, Target, Flame, Info } from 'lucide-react';
import type {
  Asset,
  AssetEntry,
  CurrencyCode,
  FireInputs,
  FireVariant,
  SavingsGoal,
} from '../types';
import { currencySymbol, formatCurrency, formatDateFull, todayISO, uid } from '../utils';
import { assetNativeValue, computeFireTarget, estimateGoalReachDate } from '../storage';
import { useT, useLocale } from '../i18n';
import { getAssetIcon } from './assetIcons';
import PercentInput from './PercentInput';

interface Props {
  currency: CurrencyCode;
  goal: SavingsGoal | undefined;
  assets: Asset[];
  entries: AssetEntry[];
  conversionRates: Partial<Record<CurrencyCode, number>>;
  onSave: (goal: SavingsGoal) => void;
  onDelete: () => void;
  onClose: () => void;
}

const DEFAULT_FIRE: FireInputs = {
  variant: 'regular',
  useManual: false,
  annualExpenses: 40000,
  swr: 0.04,
  currentAge: 30,
  retirementAge: 65,
  realReturn: 0.05,
  partTimeAnnualIncome: 0,
};

export default function GoalSettingsModal({
  currency,
  goal,
  assets,
  entries,
  conversionRates,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  const [type, setType] = useState<'amount' | 'fire'>(goal?.type ?? 'amount');
  const [label, setLabel] = useState(goal?.label ?? '');
  const [amount, setAmount] = useState(goal?.targetAmount?.toString() ?? '');
  const [date, setDate] = useState(goal?.targetDate ?? oneYearFromToday());
  const [fire, setFire] = useState<FireInputs>(goal?.fire ?? DEFAULT_FIRE);
  const [manualAmount, setManualAmount] = useState(
    goal?.fire?.useManual ? goal.targetAmount?.toString() ?? '' : ''
  );

  // Contributions: default to "all assets 100%" (undefined). If the user opens
  // the picker to customize we materialize the map.
  const [customContributions, setCustomContributions] = useState<boolean>(
    () => goal?.contributions !== undefined
  );
  const [contributionMap, setContributionMap] = useState<Record<string, number>>(
    () => {
      if (goal?.contributions) return { ...goal.contributions };
      // Initialize with all assets at 100%
      const init: Record<string, number> = {};
      for (const a of assets) init[a.id] = 100;
      return init;
    }
  );

  // Keep contribution map in sync when new assets appear
  useEffect(() => {
    setContributionMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const a of assets) {
        if (!(a.id in next)) {
          next[a.id] = customContributions ? 0 : 100;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [assets, customContributions]);

  const setFireField = <K extends keyof FireInputs>(key: K, value: FireInputs[K]) =>
    setFire((f) => ({ ...f, [key]: value }));

  const computedFireTarget = useMemo(() => computeFireTarget(fire), [fire]);
  const parsedAmount = Number.parseFloat(amount.replace(',', '.')) || 0;
  const parsedManualAmount = Number.parseFloat(manualAmount.replace(',', '.')) || 0;

  const finalTarget =
    type === 'amount'
      ? parsedAmount
      : fire.useManual
        ? parsedManualAmount
        : computedFireTarget;

  const canSave =
    finalTarget > 0 &&
    (type === 'fire' || !!date) &&
    (type === 'amount' || !!fire.variant);

  const buildContributions = (): Record<string, number> | undefined => {
    if (!customContributions) return undefined;
    // Only include entries with non-zero pct; drop 0s to keep the map lean
    const out: Record<string, number> = {};
    for (const [id, pct] of Object.entries(contributionMap)) {
      const bounded = Math.max(0, Math.min(100, pct));
      if (bounded > 0) out[id] = bounded;
    }
    return out;
  };

  const submit = () => {
    if (!canSave) return;
    const contributions = buildContributions();
    const id = goal?.id ?? uid();
    if (type === 'amount') {
      onSave({
        id,
        type,
        targetDate: date,
        label: label.trim() || undefined,
        contributions,
        targetAmount: Math.round(parsedAmount * 100) / 100,
      });
    } else {
      onSave({
        id,
        type,
        label: label.trim() || undefined,
        contributions,
        fire,
        targetAmount: fire.useManual
          ? Math.round(parsedManualAmount * 100) / 100
          : Math.round(computedFireTarget * 100) / 100,
        // FIRE goals don't take a target date — reach date is computed.
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <div className="label !mb-2">{t('goal.field.type')}</div>
        <div className="grid grid-cols-2 gap-2">
          <TypeCard
            active={type === 'amount'}
            icon={<Target size={16} />}
            title={t('goal.type.amount')}
            desc={t('goal.type.amountHint')}
            onClick={() => setType('amount')}
          />
          <TypeCard
            active={type === 'fire'}
            icon={<Flame size={16} />}
            title={t('goal.type.fire')}
            desc={t('goal.type.fireHint')}
            onClick={() => setType('fire')}
          />
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="label">{t('goal.field.label')}</label>
        <input
          type="text"
          className="input"
          placeholder={t('goal.field.labelPlaceholder')}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      {type === 'amount' ? (
        <div>
          <label className="label">{t('goal.field.amount')}</label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
              {currencySymbol(currency)}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="input pl-7 tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <FireInputsSection
          fire={fire}
          currency={currency}
          manualAmount={manualAmount}
          setManualAmount={setManualAmount}
          setFireField={setFireField}
          computedTarget={computedFireTarget}
          fmt={fmt}
        />
      )}

      {type === 'amount' ? (
        <div>
          <label className="label">{t('goal.field.date')}</label>
          <input
            type="date"
            className="input max-w-xs"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={todayISO()}
          />
        </div>
      ) : (
        <EstimatedReachDatePreview
          currency={currency}
          fire={fire}
          manualAmount={parsedManualAmount}
          assets={assets}
          entries={entries}
          conversionRates={conversionRates}
          contributions={buildContributions()}
        />
      )}

      {/* Contributions */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <div className="label !mb-0">{t('goal.field.contributions')}</div>
            <p className="text-xs text-slate-500 mt-1">
              {customContributions
                ? t('goal.contributions.customHint')
                : t('goal.contributions.defaultHint')}
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-accent"
              checked={customContributions}
              onChange={(e) => setCustomContributions(e.target.checked)}
            />
            {t('goal.contributions.customize')}
          </label>
        </div>

        {customContributions && (
          <div className="rounded-xl border border-surface-border overflow-hidden animate-fade-in">
            <div className="max-h-56 overflow-y-auto divide-y divide-surface-border/60">
              {assets.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">
                  {t('goal.contributions.noAssets')}
                </div>
              ) : (
                assets.map((asset) => {
                  const Icon = getAssetIcon(asset.icon);
                  const pct = contributionMap[asset.id] ?? 0;
                  const isOn = pct > 0;
                  const rate =
                    asset.currency === currency ? 1 : conversionRates[asset.currency] ?? 1;
                  const nativeVal = assetNativeValue(asset, entries);
                  const contribValue = nativeVal * rate * (pct / 100);
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <label className="inline-flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={isOn}
                          onChange={(e) =>
                            setContributionMap((prev) => ({
                              ...prev,
                              [asset.id]: e.target.checked ? 100 : 0,
                            }))
                          }
                        />
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: asset.color + '25',
                            color: asset.color,
                          }}
                        >
                          <Icon size={12} />
                        </span>
                        <span className="text-sm truncate">{asset.name}</span>
                      </label>
                      <div className="w-20 flex-shrink-0">
                        <PercentInput
                          value={pct}
                          asFraction={false}
                          min={0}
                          max={100}
                          disabled={!isOn}
                          onChange={(v) =>
                            setContributionMap((prev) => ({
                              ...prev,
                              [asset.id]: Math.round(v),
                            }))
                          }
                        />
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums w-24 text-right flex-shrink-0">
                        {isOn ? fmt(contribValue) : '—'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-2">
        {goal && (
          <button
            type="button"
            className="btn inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
            onClick={() => {
              if (confirm(t('goal.deleteConfirm'))) onDelete();
            }}
          >
            <Trash2 size={14} />
            {t('goal.deleteButton')}
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canSave}
            onClick={submit}
          >
            {t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl p-3 border transition-colors ${
        active
          ? 'bg-accent/10 border-accent/40'
          : 'bg-surface-overlay/40 border-surface-border hover:bg-surface-overlay/70'
      }`}
    >
      <div className="flex items-center gap-2 mb-1 text-slate-800 dark:text-slate-100">
        <span className={active ? 'text-accent' : 'text-slate-500'}>{icon}</span>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="text-xs text-slate-500">{desc}</div>
    </button>
  );
}

function FireInputsSection({
  fire,
  currency,
  manualAmount,
  setManualAmount,
  setFireField,
  computedTarget,
  fmt,
}: {
  fire: FireInputs;
  currency: CurrencyCode;
  manualAmount: string;
  setManualAmount: (s: string) => void;
  setFireField: <K extends keyof FireInputs>(key: K, value: FireInputs[K]) => void;
  computedTarget: number;
  fmt: (n: number) => string;
}) {
  const t = useT();
  const variants: FireVariant[] = ['regular', 'coast', 'barista'];

  return (
    <div className="space-y-4">
      <div>
        <div className="label !mb-2">{t('fire.variantLabel')}</div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-overlay border border-surface-border w-fit">
          {variants.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFireField('variant', v)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                fire.variant === v
                  ? 'bg-accent text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t(`fire.variant.${v}`)}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">{t(`fire.variantHint.${fire.variant}`)}</p>
      </div>

      <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          className="accent-accent"
          checked={fire.useManual}
          onChange={(e) => setFireField('useManual', e.target.checked)}
        />
        {t('fire.useManual')}
      </label>

      {fire.useManual ? (
        <div>
          <label className="label">{t('fire.manualAmount')}</label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
              {currencySymbol(currency)}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="input pl-7 tabular-nums"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('fire.annualExpenses')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
                  {currencySymbol(currency)}
                </span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  className="input pl-7 tabular-nums"
                  value={fire.annualExpenses ?? 0}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value.replace(',', '.'));
                    if (Number.isFinite(v)) setFireField('annualExpenses', Math.max(0, v));
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{t('fire.annualExpensesHint')}</p>
            </div>
            <div>
              <label className="label">{t('fire.swr')}</label>
              <PercentInput
                value={fire.swr ?? 0.04}
                onChange={(v) => setFireField('swr', v)}
                min={0}
                max={0.2}
              />
              <p className="text-xs text-slate-500 mt-1.5">{t('fire.swrHint')}</p>
            </div>
          </div>

          {fire.variant === 'coast' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">{t('fire.currentAge')}</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  className="input tabular-nums"
                  value={fire.currentAge ?? 30}
                  onChange={(e) => setFireField('currentAge', Number.parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div>
                <label className="label">{t('fire.retirementAge')}</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  className="input tabular-nums"
                  value={fire.retirementAge ?? 65}
                  onChange={(e) =>
                    setFireField('retirementAge', Number.parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
              <div>
                <label className="label">{t('fire.realReturn')}</label>
                <PercentInput
                  value={fire.realReturn ?? 0.05}
                  onChange={(v) => setFireField('realReturn', v)}
                  min={-1}
                  max={1}
                />
                <p className="text-xs text-slate-500 mt-1.5">{t('fire.realReturnHint')}</p>
              </div>
            </div>
          )}

          {fire.variant === 'barista' && (
            <div>
              <label className="label">{t('fire.partTimeIncome')}</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
                  {currencySymbol(currency)}
                </span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  className="input pl-7 tabular-nums"
                  value={fire.partTimeAnnualIncome ?? 0}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value.replace(',', '.'));
                    if (Number.isFinite(v)) setFireField('partTimeAnnualIncome', Math.max(0, v));
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{t('fire.partTimeIncomeHint')}</p>
            </div>
          )}

          <div className="rounded-xl bg-accent/10 border border-accent/30 p-3 flex items-center gap-3">
            <Info size={16} className="text-accent flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                {t('fire.computedTarget')}
              </div>
              <div className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {fmt(computedTarget)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EstimatedReachDatePreview({
  currency,
  fire,
  manualAmount,
  assets,
  entries,
  conversionRates,
  contributions,
}: {
  currency: CurrencyCode;
  fire: FireInputs;
  manualAmount: number;
  assets: Asset[];
  entries: AssetEntry[];
  conversionRates: Partial<Record<CurrencyCode, number>>;
  contributions: Record<string, number> | undefined;
}) {
  const t = useT();
  const locale = useLocale();
  const previewGoal: SavingsGoal = useMemo(
    () => ({
      id: 'preview',
      type: 'fire',
      fire,
      targetAmount: fire.useManual ? manualAmount : computeFireTarget(fire),
      contributions,
    }),
    [fire, manualAmount, contributions]
  );
  const estimated = useMemo(
    () => estimateGoalReachDate(previewGoal, assets, entries, currency, conversionRates),
    [previewGoal, assets, entries, currency, conversionRates]
  );

  return (
    <div className="rounded-xl bg-surface-overlay/40 border border-surface-border p-3">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
        {t('goal.field.estimatedReach')}
      </div>
      <div className="text-lg font-semibold tracking-tight mt-1 tabular-nums">
        {estimated ? formatDateFull(estimated, locale) : t('goal.reach.notReachable')}
      </div>
      <p className="text-xs text-slate-500 mt-1">{t('goal.reach.hint')}</p>
    </div>
  );
}

function oneYearFromToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}
