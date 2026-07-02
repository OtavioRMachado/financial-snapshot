import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Asset, AssetProjection, AssetType, CurrencyCode } from '../types';
import { CATEGORY_PALETTE, currencySymbol, uid } from '../utils';
import { ASSET_ICON_KEYS, getAssetIcon } from './assetIcons';
import { useT } from '../i18n';

interface Props {
  /** Undefined when creating a new asset */
  asset: Asset | null;
  currency: CurrencyCode;
  entryCount: number;
  onSave: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const DEFAULT_PROJECTION: AssetProjection = {
  enabled: true,
  annualReturnRate: 0.07,
  monthlyContribution: 0,
  years: 10,
};

export default function AssetSettingsModal({
  asset,
  currency,
  entryCount,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const t = useT();
  const isNew = asset === null;

  const [draft, setDraft] = useState<Asset>(() =>
    asset ?? {
      id: uid(),
      name: '',
      type: 'snapshot',
      currency,
      color: CATEGORY_PALETTE[Math.floor(Math.random() * CATEGORY_PALETTE.length)],
      icon: 'wallet',
    }
  );

  const [projectionDraft, setProjectionDraft] = useState<AssetProjection>(
    () => asset?.projection ?? DEFAULT_PROJECTION
  );
  const [projectionEnabled, setProjectionEnabled] = useState<boolean>(
    () => Boolean(asset?.projection?.enabled)
  );

  useEffect(() => {
    if (asset) {
      setDraft(asset);
      setProjectionDraft(asset.projection ?? DEFAULT_PROJECTION);
      setProjectionEnabled(Boolean(asset.projection?.enabled));
    }
  }, [asset]);

  const setField = <K extends keyof Asset>(key: K, value: Asset[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const canSave = useMemo(() => draft.name.trim().length > 0, [draft.name]);

  const submit = () => {
    if (!canSave) return;
    const finalProjection: AssetProjection | undefined =
      draft.type === 'snapshot' && projectionEnabled
        ? { ...projectionDraft, enabled: true }
        : undefined;

    onSave({
      ...draft,
      name: draft.name.trim(),
      projection: finalProjection,
    });
  };

  const handleDelete = () => {
    if (!asset) return;
    if (!confirm(t('assets.deleteConfirm', { name: asset.name, count: entryCount }))) return;
    onDelete(asset.id);
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="label">{t('assets.field.name')}</label>
        <input
          type="text"
          className="input"
          value={draft.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder={t('assets.field.namePlaceholder')}
          autoFocus
        />
      </div>

      {/* Type */}
      <div>
        <div className="label !mb-2">{t('assets.field.type')}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <TypeCard
            active={draft.type === 'snapshot'}
            onClick={() => setField('type', 'snapshot' as AssetType)}
            title={t('assets.type.snapshot')}
            desc={t('assets.type.snapshotHint')}
          />
          <TypeCard
            active={draft.type === 'cumulative'}
            onClick={() => setField('type', 'cumulative' as AssetType)}
            title={t('assets.type.cumulative')}
            desc={t('assets.type.cumulativeHint')}
          />
        </div>
      </div>

      {/* Currency + color + icon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">{t('assets.field.currency')}</label>
          <select
            className="input appearance-none pr-8"
            value={draft.currency}
            onChange={(e) => setField('currency', e.target.value as CurrencyCode)}
          >
            {(['EUR', 'USD', 'BRL', 'GBP'] as CurrencyCode[]).map((c) => (
              <option key={c} value={c}>
                {c} ({currencySymbol(c)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">{t('assets.field.color')}</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {CATEGORY_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField('color', c)}
                className={`w-7 h-7 rounded-md border ${
                  c === draft.color ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">{t('assets.field.icon')}</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ASSET_ICON_KEYS.map((key) => {
              const Icon = getAssetIcon(key);
              const active = draft.icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setField('icon', key)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
                    active
                      ? 'border-accent bg-accent/15 text-accent-soft'
                      : 'border-surface-border bg-surface-overlay/50 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  aria-label={`icon ${key}`}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projection (snapshot only) */}
      {draft.type === 'snapshot' && (
        <div className="rounded-xl border border-surface-border p-4 bg-surface-overlay/30">
          <label className="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 cursor-pointer select-none mb-3">
            <input
              type="checkbox"
              className="accent-accent"
              checked={projectionEnabled}
              onChange={(e) => setProjectionEnabled(e.target.checked)}
            />
            <span className="font-medium">{t('assets.projection.enabled')}</span>
            <span className="text-xs text-slate-500">— {t('assets.projection.hint')}</span>
          </label>

          {projectionEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div>
                <label className="label">{t('projection.annualReturn')}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    className="input pr-8 tabular-nums"
                    value={(projectionDraft.annualReturnRate * 100).toString()}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value.replace(',', '.'));
                      if (Number.isFinite(v))
                        setProjectionDraft((p) => ({ ...p, annualReturnRate: v / 100 }));
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="label">{t('projection.monthlyContribution')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm pointer-events-none">
                    {currencySymbol(draft.currency)}
                  </span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    className="input pl-7 tabular-nums"
                    value={projectionDraft.monthlyContribution.toString()}
                    onChange={(e) => {
                      const v = Number.parseFloat(e.target.value.replace(',', '.'));
                      if (Number.isFinite(v))
                        setProjectionDraft((p) => ({
                          ...p,
                          monthlyContribution: Math.max(0, v),
                        }));
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="label">{t('projection.horizon')}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="60"
                    className="input pr-14 tabular-nums"
                    value={projectionDraft.years.toString()}
                    onChange={(e) => {
                      const v = Number.parseInt(e.target.value, 10);
                      if (Number.isFinite(v))
                        setProjectionDraft((p) => ({
                          ...p,
                          years: Math.max(1, Math.min(60, v)),
                        }));
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 text-sm">
                    {t('common.years')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        {!isNew && (
          <button
            type="button"
            className="btn inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
            {t('assets.deleteAsset')}
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
            {isNew ? t('assets.createAsset') : t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
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
      <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{title}</div>
      <div className="text-xs text-slate-500 mt-1">{desc}</div>
    </button>
  );
}
