import { useRef } from 'react';
import { Download, Upload, Trash2, Info } from 'lucide-react';
import type { AppState } from '../types';
import { normalizeState, resetState, stateSummary } from '../storage';
import { useT } from '../i18n';

interface Props {
  state: AppState;
  onImport: (imported: AppState) => void;
  onReset: () => void;
  onToast: (msg: string) => void;
  onClose: () => void;
}

export default function DataModal({ state, onImport, onReset, onToast, onClose }: Props) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const summary = stateSummary(state);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `financial-tracker-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChosen = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const normalized = normalizeState(parsed);
        if (!confirm(t('data.import.confirm'))) return;
        onImport(normalized);
        onToast(t('data.import.success'));
        onClose();
      } catch (err) {
        console.error('Import failed', err);
        onToast(t('data.import.errorInvalid'));
      }
    };
    reader.onerror = () => onToast(t('data.import.errorRead'));
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm(t('data.reset.confirm'))) return;
    resetState();
    onReset();
  };

  return (
    <div className="space-y-6">
      {/* Current data summary */}
      <div className="rounded-xl bg-surface-overlay/40 border border-surface-border p-3 sm:p-4">
        <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-medium mb-2 flex items-center gap-1.5">
          <Info size={12} />
          {t('data.currentSummary')}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="chip">{t('data.preview.months', { n: summary.months })}</span>
          <span className="chip">{t('data.preview.expenses', { n: summary.expenses })}</span>
          <span className="chip">{t('data.preview.assets', { n: summary.assets })}</span>
          <span className="chip">
            {t('data.preview.assetEntries', { n: summary.assetEntries })}
          </span>
        </div>
      </div>

      {/* Export */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Download size={15} className="text-emerald-400" />
          {t('data.export.title')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('data.export.desc')}</p>
        <button className="btn-primary" onClick={handleExport}>
          <Download size={14} />
          {t('data.export.button')}
        </button>
      </section>

      <div className="divider" />

      {/* Import */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Upload size={15} className="text-accent" />
          {t('data.import.title')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('data.import.desc')}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChosen(file);
            e.target.value = ''; // allow re-selecting the same file
          }}
        />
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} />
          {t('data.import.button')}
        </button>
      </section>

      <div className="divider" />

      {/* Reset */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <Trash2 size={15} className="text-rose-400" />
          {t('data.reset.title')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('data.reset.desc')}</p>
        <button
          className="btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
          onClick={handleReset}
        >
          <Trash2 size={14} />
          {t('data.reset.button')}
        </button>
      </section>
    </div>
  );
}
