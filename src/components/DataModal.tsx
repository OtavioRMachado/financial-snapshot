import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Info, Lock, Unlock, FileText } from 'lucide-react';
import type { AppState } from '../types';
import { normalizeState, resetState, stateSummary } from '../storage';
import {
  decryptEnvelope,
  encryptToEnvelope,
  isEncryptedEnvelope,
} from '../crypto';
import { useT } from '../i18n';

interface Props {
  state: AppState;
  onImport: (imported: AppState) => void;
  onReset: () => void;
  onOpenCsvImport: () => void;
  onToast: (msg: string) => void;
  onClose: () => void;
}

export default function DataModal({
  state,
  onImport,
  onReset,
  onOpenCsvImport,
  onToast,
  onClose,
}: Props) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const summary = stateSummary(state);
  const [encryptExport, setEncryptExport] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingEncrypted, setPendingEncrypted] = useState<{
    envelope: object;
  } | null>(null);
  const [importPassword, setImportPassword] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (encryptExport && exportPassword.length < 8) {
      onToast(t('data.encrypt.passwordTooShort'));
      return;
    }
    setBusy(true);
    try {
      const json = JSON.stringify(state, null, 2);
      const today = new Date().toISOString().slice(0, 10);
      let payload: string;
      let filename: string;
      if (encryptExport) {
        const envelope = await encryptToEnvelope(json, exportPassword);
        payload = JSON.stringify(envelope, null, 2);
        filename = `financial-tracker-${today}.enc.json`;
      } else {
        payload = json;
        filename = `financial-tracker-${today}.json`;
      }
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportPassword('');
    } catch (err) {
      console.error(err);
      onToast(t('data.import.errorInvalid'));
    } finally {
      setBusy(false);
    }
  };

  const handleFileChosen = (file: File) => {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (isEncryptedEnvelope(parsed)) {
          setPendingEncrypted({ envelope: parsed });
        } else {
          const normalized = normalizeState(parsed);
          if (!confirm(t('data.import.confirm'))) return;
          onImport(normalized);
          onToast(t('data.import.success'));
          onClose();
        }
      } catch (err) {
        console.error('Import failed', err);
        onToast(t('data.import.errorInvalid'));
      }
    };
    reader.onerror = () => onToast(t('data.import.errorRead'));
    reader.readAsText(file);
  };

  const handleDecryptAndImport = async () => {
    if (!pendingEncrypted) return;
    setBusy(true);
    setImportError(null);
    try {
      const envelope = pendingEncrypted.envelope as Parameters<typeof decryptEnvelope>[0];
      const plaintext = await decryptEnvelope(envelope, importPassword);
      const parsed = JSON.parse(plaintext);
      const normalized = normalizeState(parsed);
      if (!confirm(t('data.import.confirm'))) return;
      onImport(normalized);
      onToast(t('data.import.success'));
      setPendingEncrypted(null);
      setImportPassword('');
      onClose();
    } catch (err) {
      console.error(err);
      setImportError(t('data.encrypt.wrongPassword'));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    if (!confirm(t('data.reset.confirm'))) return;
    resetState();
    onReset();
  };

  return (
    <div className="space-y-6">
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

        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none mb-3">
          <input
            type="checkbox"
            className="accent-accent"
            checked={encryptExport}
            onChange={(e) => setEncryptExport(e.target.checked)}
          />
          <Lock size={13} className={encryptExport ? 'text-accent' : 'text-slate-500'} />
          {t('data.encrypt.encryptCheckbox')}
        </label>

        {encryptExport && (
          <div className="mb-3 animate-fade-in">
            <label className="label">{t('data.encrypt.password')}</label>
            <input
              type="password"
              className="input max-w-md"
              value={exportPassword}
              onChange={(e) => setExportPassword(e.target.value)}
              placeholder={t('data.encrypt.passwordPlaceholder')}
              autoComplete="new-password"
            />
            <p className="text-xs text-slate-500 mt-1.5">{t('data.encrypt.passwordHint')}</p>
          </div>
        )}

        <button
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleExport}
          disabled={busy || (encryptExport && exportPassword.length < 8)}
        >
          <Download size={14} />
          {encryptExport
            ? t('data.encrypt.exportButton')
            : t('data.export.button')}
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
            e.target.value = '';
          }}
        />
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} />
          {t('data.import.button')}
        </button>

        {pendingEncrypted && (
          <div className="mt-4 p-4 rounded-xl bg-surface-overlay/50 border border-accent/40 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Unlock size={14} className="text-accent" />
              {t('data.encrypt.detectedEncrypted')}
            </div>
            <input
              type="password"
              className="input mb-2"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              placeholder={t('data.encrypt.password')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDecryptAndImport();
              }}
              autoFocus
              autoComplete="current-password"
            />
            {importError && (
              <p className="text-xs text-rose-500 dark:text-rose-400 mb-2">{importError}</p>
            )}
            <div className="flex items-center gap-2 justify-end">
              <button
                className="btn-secondary !py-1.5 text-xs"
                onClick={() => {
                  setPendingEncrypted(null);
                  setImportPassword('');
                  setImportError(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary !py-1.5 text-xs disabled:opacity-40"
                disabled={busy || importPassword.length === 0}
                onClick={handleDecryptAndImport}
              >
                {busy ? t('data.encrypt.decrypting') : t('data.encrypt.decryptButton')}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="divider" />

      {/* CSV import */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <FileText size={15} className="text-accent" />
          {t('csv.title')}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{t('csv.subtitle')}</p>
        <button
          className="btn-secondary"
          onClick={() => {
            onClose();
            onOpenCsvImport();
          }}
        >
          <FileText size={14} />
          {t('csv.chooseFile')}
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
