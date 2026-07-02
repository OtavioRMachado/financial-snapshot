import { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  Wallet,
  TrendingUp,
  Receipt,
  Languages,
  Database,
  Coffee,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import type {
  AppState,
  Asset,
  AssetEntry,
  Category,
  CurrencyCode,
  Expense,
  Month,
  RecurringExpense,
  Theme,
} from './types';
import {
  addRecurring,
  applyBudgetsToFutureMonths,
  ensureMonth,
  futureMonthCount,
  loadState,
  saveState,
  stopRecurring,
} from './storage';
import { currentMonthKey, formatCurrency, shiftMonth, uid } from './utils';
import type { RecurringMeta } from './components/AddExpenseForm';
import MonthNavigator from './components/MonthNavigator';
import BudgetOverview from './components/BudgetOverview';
import CategoryBreakdown from './components/CategoryBreakdown';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetSettings from './components/BudgetSettings';
import Modal from './components/Modal';
import Toast from './components/Toast';
import InvestmentsView from './components/InvestmentsView';
import DataModal from './components/DataModal';
import {
  LanguageProvider,
  useT,
  useLanguage,
  LANGUAGE_LABELS,
  type Language,
} from './i18n';

type Tab = 'expenses' | 'investments';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply the theme class to <html> whenever it changes; when 'auto', follow the
  // OS `prefers-color-scheme` and react to changes at runtime. Kept at the top
  // level so it runs regardless of which subview is mounted.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const compute = (theme: Theme) =>
      theme === 'dark' || (theme === 'auto' && media.matches);
    document.documentElement.classList.toggle('dark', compute(state.theme));

    if (state.theme === 'auto') {
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [state.theme]);

  return (
    <LanguageProvider
      language={state.language}
      onChange={(l) => setState((s) => ({ ...s, language: l }))}
    >
      <AppInner state={state} setState={setState} />
    </LanguageProvider>
  );
}

function AppInner({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const t = useT();
  const { language, locale, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [activeMonthId, setActiveMonthId] = useState<string>(() => currentMonthKey());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState((s) => ensureMonth(s, activeMonthId));
  }, [activeMonthId, setState]);

  const month: Month = state.months[activeMonthId] ?? {
    id: activeMonthId,
    year: parseInt(activeMonthId.split('-')[0]!, 10),
    month: parseInt(activeMonthId.split('-')[1]!, 10),
    salary: 0,
    categories: [],
    expenses: [],
  };

  const recentCategoryIds = useMemo(() => {
    const sorted = [...month.expenses].sort((a, b) => b.createdAt - a.createdAt);
    const ids: string[] = [];
    for (const e of sorted) {
      if (!ids.includes(e.categoryId)) ids.push(e.categoryId);
    }
    return ids;
  }, [month.expenses]);

  const updateMonth = (patch: Partial<Month> | ((m: Month) => Partial<Month>)) => {
    setState((s) => {
      const current = s.months[activeMonthId] ?? month;
      const p = typeof patch === 'function' ? patch(current) : patch;
      return {
        ...s,
        months: { ...s.months, [activeMonthId]: { ...current, ...p } },
      };
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const monthWord = (n: number) => (n === 1 ? t('common.month') : t('common.months'));

  // --- Expense handlers ---

  const handleAddExpense = (expense: Expense, recurring?: RecurringMeta) => {
    if (!recurring) {
      updateMonth((m) => ({ expenses: [...m.expenses, expense] }));
      showToast(
        t('toast.added', { amount: formatCurrency(expense.amount, state.currency, { locale }) })
      );
      return;
    }

    const recurringId = uid();
    const category = month.categories.find((c) => c.id === expense.categoryId);
    const [, , dayStr] = expense.date.split('-');
    const dayOfMonth = parseInt(dayStr, 10);
    const endMonthId =
      recurring.duration === 'indefinite'
        ? null
        : shiftMonth(activeMonthId, recurring.duration - 1);

    const template: RecurringExpense = {
      id: recurringId,
      amount: expense.amount,
      description: expense.description,
      categoryId: expense.categoryId,
      categoryName: category?.name ?? '',
      dayOfMonth,
      startMonthId: activeMonthId,
      endMonthId,
    };

    const firstInstance: Expense = { ...expense, recurringId };

    setState((s) => {
      const withFirst: AppState = {
        ...s,
        months: {
          ...s.months,
          [activeMonthId]: {
            ...(s.months[activeMonthId] ?? month),
            expenses: [...(s.months[activeMonthId]?.expenses ?? []), firstInstance],
          },
        },
      };
      return addRecurring(withFirst, template);
    });

    const amountStr = formatCurrency(expense.amount, state.currency, { locale });
    showToast(
      recurring.duration === 'indefinite'
        ? t('toast.addedRecurringIndef', { amount: amountStr })
        : t('toast.addedRecurringFor', { amount: amountStr, n: recurring.duration })
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    updateMonth((m) => ({ expenses: m.expenses.filter((e) => e.id !== expenseId) }));
  };

  const handleStopRecurring = (recurringId: string) => {
    setState((s) => stopRecurring(s, recurringId, shiftMonth(activeMonthId, 1)));
    showToast(t('toast.stoppedRecurring'));
  };

  const handleSaveSettings = (patch: {
    salary: number;
    categories: Category[];
    applyToFuture: boolean;
  }) => {
    setState((s) => {
      const current = s.months[activeMonthId] ?? month;
      const withCurrent: AppState = {
        ...s,
        months: {
          ...s.months,
          [activeMonthId]: { ...current, salary: patch.salary, categories: patch.categories },
        },
      };
      if (!patch.applyToFuture) return withCurrent;
      return applyBudgetsToFutureMonths(
        withCurrent,
        activeMonthId,
        patch.salary,
        patch.categories
      );
    });
    setSettingsOpen(false);
    const count = futureMonthCount(state, activeMonthId);
    showToast(
      patch.applyToFuture && count > 0
        ? t('toast.budgetUpdatedPropagated', { count, monthWord: monthWord(count) })
        : t('toast.budgetUpdated')
    );
  };

  const setCurrency = (code: CurrencyCode) => {
    setState((s) => ({ ...s, currency: code }));
    setCurrencyMenuOpen(false);
  };

  // --- Asset handlers ---

  const handleSaveAsset = (asset: Asset) => {
    setState((s) => {
      const exists = s.assets.some((a) => a.id === asset.id);
      const nextAssets = exists
        ? s.assets.map((a) => (a.id === asset.id ? asset : a))
        : [...s.assets, asset];
      return { ...s, assets: nextAssets };
    });
    showToast(t('toast.assetSaved', { name: asset.name }));
  };

  const handleDeleteAsset = (id: string) => {
    setState((s) => ({
      ...s,
      assets: s.assets.filter((a) => a.id !== id),
      assetEntries: s.assetEntries.filter((e) => e.assetId !== id),
    }));
    showToast(t('toast.assetDeleted'));
  };

  const handleAddAssetEntry = (entry: AssetEntry) => {
    setState((s) => ({ ...s, assetEntries: [...s.assetEntries, entry] }));
    const asset = state.assets.find((a) => a.id === entry.assetId);
    if (asset) {
      showToast(
        t('toast.entryAdded', {
          name: asset.name,
          amount: formatCurrency(entry.amount, asset.currency, { locale }),
        })
      );
    }
  };

  const handleDeleteAssetEntry = (id: string) => {
    setState((s) => ({ ...s, assetEntries: s.assetEntries.filter((e) => e.id !== id) }));
  };

  const handleUpdateConversionRate = (currency: CurrencyCode, rate: number) => {
    setState((s) => ({
      ...s,
      conversionRates: { ...s.conversionRates, [currency]: rate },
    }));
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <Wallet size={16} className="text-accent" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="font-semibold tracking-tight">{t('app.title')}</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">{t('app.subtitle')}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-overlay border border-surface-border">
            <TabButton
              active={activeTab === 'expenses'}
              onClick={() => setActiveTab('expenses')}
              icon={<Receipt size={14} />}
              label={t('app.tab.expenses')}
            />
            <TabButton
              active={activeTab === 'investments'}
              onClick={() => setActiveTab('investments')}
              icon={<TrendingUp size={14} />}
              label={t('app.tab.wealth')}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="btn-ghost !py-1.5 !px-2 text-xs flex items-center gap-1"
              onClick={() => setDataOpen(true)}
              aria-label={t('data.modal.title')}
              title={t('data.modal.title')}
            >
              <Database size={14} />
            </button>
            <div className="relative">
              <button
                className="btn-ghost !py-1.5 !px-2 text-xs flex items-center gap-1"
                onClick={() => setThemeMenuOpen((o) => !o)}
                aria-label={t('app.theme.label')}
                title={t('app.theme.label')}
              >
                {state.theme === 'dark' ? (
                  <Moon size={14} />
                ) : state.theme === 'light' ? (
                  <Sun size={14} />
                ) : (
                  <Monitor size={14} />
                )}
              </button>
              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setThemeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 z-40 card p-1">
                    {(['auto', 'light', 'dark'] as Theme[]).map((th) => {
                      const Icon = th === 'dark' ? Moon : th === 'light' ? Sun : Monitor;
                      return (
                        <button
                          key={th}
                          onClick={() => {
                            setState((s) => ({ ...s, theme: th }));
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-overlay ${
                            state.theme === th ? 'text-accent-soft' : ''
                          }`}
                        >
                          <Icon size={14} />
                          {t(`app.theme.${th}`)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                className="btn-ghost !py-1.5 !px-2 text-xs flex items-center gap-1"
                onClick={() => setLangMenuOpen((o) => !o)}
                aria-label={t('app.language.chooseLabel')}
              >
                <Languages size={14} />
                {LANGUAGE_LABELS[language].short}
              </button>
              {langMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setLangMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 z-40 card p-1">
                    {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setLanguage(l);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-overlay ${
                          language === l ? 'text-accent-soft' : ''
                        }`}
                      >
                        {LANGUAGE_LABELS[l].full}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                className="btn-ghost !py-1.5 text-xs uppercase tracking-wide"
                onClick={() => setCurrencyMenuOpen((o) => !o)}
              >
                {state.currency}
              </button>
              {currencyMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setCurrencyMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 z-40 card p-1">
                    {(['EUR', 'USD', 'BRL', 'GBP'] as CurrencyCode[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-overlay ${
                          state.currency === c ? 'text-accent-soft' : ''
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'expenses' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <MonthNavigator
                monthId={activeMonthId}
                onPrev={() => setActiveMonthId((k) => shiftMonth(k, -1))}
                onNext={() => setActiveMonthId((k) => shiftMonth(k, 1))}
                onJumpToday={() => setActiveMonthId(currentMonthKey())}
              />
              <button className="btn-secondary !py-1.5" onClick={() => setSettingsOpen(true)}>
                <Settings size={15} />
                <span className="hidden sm:inline">{t('budget.settingsButton')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetOverview month={month} currency={state.currency} />
              <CategoryBreakdown
                month={month}
                currency={state.currency}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>

            <AddExpenseForm
              month={month}
              currency={state.currency}
              onAdd={handleAddExpense}
              recentCategoryIds={recentCategoryIds}
            />

            <ExpenseList
              month={month}
              currency={state.currency}
              recurring={state.recurringExpenses}
              onDelete={handleDeleteExpense}
              onStopRecurring={handleStopRecurring}
            />
          </div>
        ) : (
          <InvestmentsView
            assets={state.assets}
            entries={state.assetEntries}
            currency={state.currency}
            conversionRates={state.conversionRates}
            onSaveAsset={handleSaveAsset}
            onDeleteAsset={handleDeleteAsset}
            onAddEntry={handleAddAssetEntry}
            onDeleteEntry={handleDeleteAssetEntry}
            onUpdateConversionRate={handleUpdateConversionRate}
          />
        )}

        <footer className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 dark:text-slate-600 pt-8">
          <span>{t('app.footer')}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <a
            href="https://buymeacoffee.com/otavio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors"
          >
            <Coffee size={12} />
            {t('app.buyMeACoffee')}
          </a>
        </footer>
      </main>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t('budgetSettings.title')}
        size="lg"
      >
        <BudgetSettings
          month={month}
          currency={state.currency}
          futureMonthCount={futureMonthCount(state, activeMonthId)}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      </Modal>

      <Modal
        open={dataOpen}
        onClose={() => setDataOpen(false)}
        title={t('data.modal.title')}
        size="md"
      >
        <DataModal
          state={state}
          onImport={(imported) => setState(imported)}
          onReset={() => window.location.reload()}
          onToast={showToast}
          onClose={() => setDataOpen(false)}
        />
      </Modal>

      <Toast message={toast} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white shadow-soft'
          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-surface-border/60'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
