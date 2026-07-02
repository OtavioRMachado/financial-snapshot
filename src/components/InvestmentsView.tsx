import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Asset, AssetEntry, CurrencyCode } from '../types';
import PatrimonySummary from './PatrimonySummary';
import AssetSection from './AssetSection';
import AssetSettingsModal from './AssetSettingsModal';
import Modal from './Modal';
import { useT } from '../i18n';
import { getAssetIcon } from './assetIcons';

interface Props {
  assets: Asset[];
  entries: AssetEntry[];
  currency: CurrencyCode;
  conversionRates: Partial<Record<CurrencyCode, number>>;
  onSaveAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onAddEntry: (entry: AssetEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateConversionRate: (currency: CurrencyCode, rate: number) => void;
}

export default function InvestmentsView({
  assets,
  entries,
  currency,
  conversionRates,
  onSaveAsset,
  onDeleteAsset,
  onAddEntry,
  onDeleteEntry,
  onUpdateConversionRate,
}: Props) {
  const t = useT();
  const [activeAssetId, setActiveAssetId] = useState<string | null>(
    () => assets[0]?.id ?? null
  );
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [creatingAsset, setCreatingAsset] = useState(false);

  // Keep the active asset valid as the list changes
  useEffect(() => {
    if (assets.length === 0) {
      setActiveAssetId(null);
      return;
    }
    if (!activeAssetId || !assets.some((a) => a.id === activeAssetId)) {
      setActiveAssetId(assets[0].id);
    }
  }, [assets, activeAssetId]);

  const activeAsset = useMemo(
    () => assets.find((a) => a.id === activeAssetId) ?? null,
    [assets, activeAssetId]
  );
  const activeEntries = useMemo(
    () => (activeAsset ? entries.filter((e) => e.assetId === activeAsset.id) : []),
    [entries, activeAsset]
  );

  const openAdd = () => {
    setEditingAsset(null);
    setCreatingAsset(true);
  };
  const openEdit = (asset: Asset) => {
    setCreatingAsset(false);
    setEditingAsset(asset);
  };
  const closeModal = () => {
    setEditingAsset(null);
    setCreatingAsset(false);
  };

  const modalOpen = creatingAsset || editingAsset !== null;
  const modalAsset = editingAsset;
  const modalEntryCount = editingAsset
    ? entries.filter((e) => e.assetId === editingAsset.id).length
    : 0;

  return (
    <div className="space-y-6">
      <PatrimonySummary
        currency={currency}
        conversionRates={conversionRates}
        assets={assets}
        entries={entries}
        activeAssetId={activeAssetId}
        onSelectAsset={setActiveAssetId}
        onAddAsset={openAdd}
      />

      {assets.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-overlay border border-surface-border w-fit flex-wrap max-w-full">
          {assets.map((a) => {
            const Icon = getAssetIcon(a.icon);
            const active = a.id === activeAssetId;
            return (
              <button
                key={a.id}
                onClick={() => setActiveAssetId(a.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-white shadow-soft'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-surface-border/60'
                }`}
              >
                <Icon size={14} />
                <span className="truncate max-w-[140px]">{a.name}</span>
              </button>
            );
          })}
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-border/60 transition-colors"
            title={t('assets.addAsset')}
          >
            <Plus size={14} />
            {t('assets.addAsset')}
          </button>
        </div>
      )}

      {activeAsset ? (
        <AssetSection
          asset={activeAsset}
          entries={activeEntries}
          appCurrency={currency}
          conversionRate={
            activeAsset.currency === currency
              ? 1
              : conversionRates[activeAsset.currency] ?? 1
          }
          onAddEntry={onAddEntry}
          onDeleteEntry={onDeleteEntry}
          onUpdateConversionRate={onUpdateConversionRate}
          onOpenSettings={() => openEdit(activeAsset)}
        />
      ) : null}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalAsset ? t('assets.editAsset') : t('assets.addAsset')}
        size="lg"
      >
        <AssetSettingsModal
          asset={modalAsset}
          currency={currency}
          entryCount={modalEntryCount}
          onSave={(asset) => {
            onSaveAsset(asset);
            if (creatingAsset) setActiveAssetId(asset.id);
            closeModal();
          }}
          onDelete={(id) => {
            onDeleteAsset(id);
            closeModal();
          }}
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
}
