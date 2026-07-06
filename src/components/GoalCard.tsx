import { Target, Pencil, Flame } from 'lucide-react';
import type { Asset, AssetEntry, CurrencyCode, SavingsGoal } from '../types';
import { formatCurrency, formatDateFull, parseISODate } from '../utils';
import {
  computeGoalTargetAmount,
  contributingPatrimony,
  estimateGoalReachDate,
} from '../storage';
import { useT, useLocale } from '../i18n';

interface Props {
  goal: SavingsGoal | undefined;
  assets: Asset[];
  entries: AssetEntry[];
  currency: CurrencyCode;
  conversionRates: Partial<Record<CurrencyCode, number>>;
  onEdit: () => void;
}

export default function GoalCard({
  goal,
  assets,
  entries,
  currency,
  conversionRates,
  onEdit,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, currency, { locale });

  if (!goal) {
    return (
      <button
        onClick={onEdit}
        className="card p-4 sm:p-6 w-full text-left border-dashed hover:border-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-accent" />
          </div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">
              {t('goal.emptyTitle')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{t('goal.emptySubtitle')}</div>
          </div>
        </div>
      </button>
    );
  }

  const target = computeGoalTargetAmount(goal);
  const contributing = contributingPatrimony(goal, assets, entries, currency, conversionRates);
  const pct = target > 0 ? (contributing / target) * 100 : 0;
  const cappedPct = Math.min(Math.max(pct, 0), 100);
  const remaining = target - contributing;
  const achieved = remaining <= 0 && target > 0;

  const isFire = goal.type === 'fire';

  // For amount goals we use the user-picked target date; for FIRE we estimate.
  const targetDate = isFire
    ? estimateGoalReachDate(goal, assets, entries, currency, conversionRates)
    : goal.targetDate
      ? parseISODate(goal.targetDate)
      : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = targetDate
    ? Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / msPerDay))
    : null;
  const monthsRemaining =
    daysRemaining !== null ? Math.max(1, Math.round(daysRemaining / 30.44)) : null;
  const suggestedMonthly =
    monthsRemaining !== null ? Math.max(0, remaining) / monthsRemaining : 0;
  const overdue =
    targetDate !== null && daysRemaining === 0 && targetDate.getTime() < today.getTime();

  const usingSubset = goal.contributions !== undefined;
  const contributingAssetIds = usingSubset
    ? Object.entries(goal.contributions!)
        .filter(([, v]) => v > 0)
        .map(([k]) => k)
    : assets.map((a) => a.id);
  const contributingCount = contributingAssetIds.length;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
            {isFire ? (
              <Flame size={16} className="text-accent" />
            ) : (
              <Target size={16} className="text-accent" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">
              {goal.label ||
                (isFire ? t(`fire.variant.${goal.fire?.variant ?? 'regular'}`) : t('goal.defaultLabel'))}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
              {isFire ? (
                targetDate ? (
                  achieved ? (
                    <span>{t('goal.reach.achieved')}</span>
                  ) : (
                    <span>{t('goal.reach.by', { date: formatDateFull(targetDate, locale) })}</span>
                  )
                ) : (
                  <span>{t('goal.reach.notReachable')}</span>
                )
              ) : targetDate ? (
                <span>{t('goal.by', { date: formatDateFull(targetDate, locale) })}</span>
              ) : null}
              {usingSubset && (
                <span className="chip !py-0 !px-1.5 !text-[10px]">
                  {t('goal.contributingCount', { n: contributingCount })}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="btn-ghost !p-2"
          aria-label={t('goal.editButton')}
          title={t('goal.editButton')}
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
            {fmt(contributing)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {t('goal.of', { total: fmt(target) })}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-semibold tabular-nums ${
              achieved ? 'text-emerald-500 dark:text-emerald-400' : ''
            }`}
          >
            {pct.toFixed(0)}%
          </div>
          {achieved ? (
            <div className="text-xs text-emerald-500 dark:text-emerald-400 font-medium mt-0.5">
              {t('goal.achieved')}
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-0.5">
              {t('goal.remaining', { amount: fmt(remaining) })}
            </div>
          )}
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-surface-overlay overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out ${
            achieved
              ? 'from-emerald-400 to-teal-400'
              : pct >= 66
                ? 'from-emerald-400 to-emerald-500'
                : pct >= 33
                  ? 'from-yellow-400 to-amber-400'
                  : 'from-accent to-accent-soft'
          }`}
          style={{ width: `${cappedPct}%` }}
        />
      </div>

      {!achieved && targetDate && (
        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
          <span className="text-slate-500">
            {overdue
              ? t('goal.overdue')
              : t('goal.daysLeft', { days: daysRemaining ?? 0 })}
          </span>
          {!overdue && daysRemaining !== null && daysRemaining > 0 && !isFire && (
            <span className="text-slate-500 tabular-nums">
              {t('goal.needMonthly', { amount: fmt(suggestedMonthly) })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
