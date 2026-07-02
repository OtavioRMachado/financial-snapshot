export type Language = 'en' | 'pt-BR';

export const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  'pt-BR': { short: 'PT', full: 'Português (BR)' },
};

export function languageToLocale(l: Language): string {
  return l === 'en' ? 'en-US' : 'pt-BR';
}

type Dict = Record<string, string>;

const en: Dict = {
  // App shell
  'app.title': 'Financial Tracker',
  'app.subtitle': 'Local · Private',
  'app.footer': 'Data is stored locally in your browser. Nothing is sent anywhere.',
  'app.buyMeACoffee': 'Buy me a coffee',
  'app.tab.expenses': 'Expenses',
  'app.tab.wealth': 'Wealth',
  'app.language.chooseLabel': 'Language',
  'app.theme.label': 'Theme',
  'app.theme.auto': 'System',
  'app.theme.light': 'Light',
  'app.theme.dark': 'Dark',

  // Common
  'common.add': 'Add',
  'common.save': 'Save',
  'common.saveChanges': 'Save changes',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.search': 'Search…',
  'common.date': 'Date',
  'common.amount': 'Amount',
  'common.description': 'Description',
  'common.category': 'Category',
  'common.of': 'of',
  'common.percentSuffix': '%',
  'common.years': 'years',
  'common.month': 'month',
  'common.months': 'months',
  'common.optional': '(optional)',

  // Month navigator
  'monthNav.prev': 'Previous month',
  'monthNav.next': 'Next month',
  'monthNav.jumpToday': 'Jump to current month',

  // Budget overview
  'budget.overview': 'Monthly budget',
  'budget.remaining': 'Remaining',
  'budget.overBy': 'Over by',
  'budget.percentUsed': '{n}% used',
  'budget.percentLeft': '{n}% left',
  'budget.setSalary': 'Set your monthly salary in Settings',
  'budget.exceeded': "You've exceeded this month's budget",
  'budget.settingsButton': 'Budget settings',

  // Category breakdown
  'category.byCategory': 'By category',
  'category.spentVsBudget': 'Spent vs budget for each category',
  'category.editBudgets': 'Edit budgets',
  'category.noneYet': 'No categories yet. Add some in Settings.',

  // Add expense form
  'addExpense.title': 'Add expense',
  'addExpense.focusPrefix': 'Press',
  'addExpense.focusSuffix': 'anywhere to focus',
  'addExpense.emptySubtitlePrefix': 'Add your first one above — press',
  'addExpense.emptySubtitleSuffix': 'for a shortcut.',
  'addExpense.descPlaceholder': 'e.g. Lunch at café',
  'addExpense.noCategories': 'No categories',
  'addExpense.repeatMonthly': 'Repeat monthly',
  'addExpense.for': 'For',
  'addExpense.monthsInclThis': '(incl. this one)',
  'addExpense.indefinitely': 'Indefinitely',
  'addExpense.submit': 'Add',

  // Expense list
  'expenseList.title': 'Expenses',
  'expenseList.recurringCount': '{n} recurring',
  'expenseList.allCategories': 'All categories',
  'expenseList.emptyTitle': 'No expenses yet this month',
  'expenseList.noMatches': 'No matches for your filters.',
  'expenseList.noDescription': 'No description',
  'expenseList.unknownCategory': 'Unknown category',
  'expenseList.recurringBadge': 'monthly',
  'expenseList.recurringBadgeIndef': 'monthly · ∞',
  'expenseList.recurringTooltip': 'Recurs monthly through {through}',
  'expenseList.recurringTooltipIndef': 'Recurs monthly (indefinite)',
  'expenseList.deleteTitle': 'Delete this expense',
  'expenseList.stopRecurrenceTitle': 'Stop recurrence',
  'expenseList.stopConfirm':
    'Stop this recurring expense? Future months will no longer include it. This month and past instances stay.',

  // Budget settings modal
  'budgetSettings.title': 'Budget settings',
  'budgetSettings.monthlySalary': 'Monthly salary (budget)',
  'budgetSettings.salaryHint':
    'This is the total budget for the month. Changes apply only to the currently selected month.',
  'budgetSettings.categoriesTitle': 'Categories & budgets',
  'budgetSettings.allocated': 'Allocated {amount} of {of}',
  'budgetSettings.overAllocated': '(over-allocated by {amount})',
  'budgetSettings.addCategory': 'Add category',
  'budgetSettings.noCategories': 'No categories yet.',
  'budgetSettings.newCategoryName': 'New category',
  'budgetSettings.categoryNamePlaceholder': 'Category name',
  'budgetSettings.removeCategoryAria': 'Remove category',
  'budgetSettings.changeColorAria': 'Change color',
  'budgetSettings.applyToFuture': 'Apply to future months',
  'budgetSettings.applyToFutureHintNone':
    'No later months have been opened yet — new months will inherit these values automatically.',
  'budgetSettings.applyToFutureHintWith':
    "Overwrites salary and category budgets in {count} later {monthWord} you've already opened. Categories you never touched there are left alone.",

  // Toasts
  'toast.added': 'Added {amount}',
  'toast.addedRecurringFor': 'Added {amount} · recurring for {n} months',
  'toast.addedRecurringIndef': 'Added {amount} · recurring monthly',
  'toast.stoppedRecurring': 'Stopped recurring expense for future months',
  'toast.budgetUpdated': 'Budget updated',
  'toast.budgetUpdatedPropagated': 'Budget updated · propagated to {count} future {monthWord}',
  'toast.assetSaved': 'Asset saved: {name}',
  'toast.assetDeleted': 'Asset deleted',
  'toast.entryAdded': '{name}: added {amount}',

  // Wealth
  'wealth.totalPatrimony': 'Total patrimony',
  'wealth.patrimonyHint': 'Sum of the latest values across all your assets.',
  'wealth.projectedIn': 'Projected in {years}y',
  'wealth.projectedGain': '+{gain} vs today',
  'wealth.projectedNote':
    'Uses the max horizon across your enabled projections. Assets without a projection stay flat.',
  'wealth.currentTotal': 'Today',
  'wealth.card.noSnapshots': 'No snapshots yet',
  'wealth.card.noVests': 'No entries yet',
  'wealth.card.snapshotCount': '{n} snapshots',
  'wealth.card.entriesCount': '{n} entries',

  // Assets
  'assets.emptyTitle': 'No assets yet',
  'assets.emptySubtitle':
    'Add your first asset — an ETF, savings account, RSU vesting, bond, real estate, anything you want to track.',
  'assets.addAsset': 'Add asset',
  'assets.editAsset': 'Edit asset',
  'assets.deleteAsset': 'Delete asset',
  'assets.createAsset': 'Create asset',
  'assets.deleteConfirm': 'Delete "{name}" and all its {count} entries? This cannot be undone.',
  'assets.field.name': 'Name',
  'assets.field.namePlaceholder': 'e.g. S&P 500 ETF, Emergency fund, Company RSUs',
  'assets.field.type': 'Type',
  'assets.field.currency': 'Currency',
  'assets.field.color': 'Color',
  'assets.field.icon': 'Icon',
  'assets.type.snapshot': 'Snapshot',
  'assets.type.snapshotHint':
    'Record the current value on a date. Latest entry = current balance. Use for ETFs, savings, bonds.',
  'assets.type.cumulative': 'Cumulative',
  'assets.type.cumulativeHint':
    'Each entry adds to a running total. Use for RSU vestings, one-off deposits, grants.',
  'assets.projection.enabled': 'Include a projection',
  'assets.projection.hint': 'Model future growth from the latest snapshot',
  'assets.rate.header': '{from} → {to} rate:',
  'assets.rate.note':
    '{name} is tracked in {currency}. This rate converts it to {app} for the patrimony total.',
  'assets.rate.approxConverted': '≈ {converted} at 1 {from} = {rate} {to}',
  'assets.section.currentValue': 'Current value',
  'assets.section.totalRecorded': 'Total recorded',
  'assets.section.asOf': 'As of {date}',
  'assets.section.sinceFirst': 'Since first record',
  'assets.section.from': 'From {date}',
  'assets.section.projectedIn': 'Projected in {years}y',
  'assets.section.projectedHint': '+{gain} at {rate}%/yr',
  'assets.section.projectedHintContrib': '+{gain} at {rate}%/yr + {contrib}/mo',
  'assets.section.entriesCount': '{n} entries · avg {avg}',
  'assets.section.emptyHint': 'Add your first entry below to start tracking.',
  'assets.form.snapshot.title': 'Record a snapshot',
  'assets.form.snapshot.amount': 'Current value',
  'assets.form.snapshot.submit': 'Save snapshot',
  'assets.form.snapshot.hint': 'The total value of {name} on this date',
  'assets.form.cumulative.title': 'Log an entry',
  'assets.form.cumulative.amount': 'Amount',
  'assets.form.cumulative.submit': 'Save entry',
  'assets.form.cumulative.hint': 'The value added to {name} for this event',
  'assets.history.snapshot': 'Snapshot history',
  'assets.history.cumulative': 'Entry history',
  'assets.history.empty': 'No entries yet. Add one above to start tracking.',

  // Projection (reused for asset settings)
  'projection.annualReturn': 'Expected annual return',
  'projection.monthlyContribution': 'Monthly contribution',
  'projection.horizon': 'Projection horizon',

  // Chart
  'chart.actual': 'Actual',
  'chart.projection': 'Projection',
  'chart.cumulative': 'Cumulative',
  'chart.emptyState': 'Add your first entry to see the chart.',

  // AddEntryForm shared strings
  'entryForm.deleteAria': 'Delete entry',
  'entryHistory.mostRecentFirst': 'Most recent first',
  'entryHistory.deltaVsPrev': '{delta} vs previous',
  'entryHistory.totalAfter': 'Total after this: {total}',

  // Data / backup
  'data.header': 'Data',
  'data.modal.title': 'Data & backups',
  'data.export.title': 'Export a backup',
  'data.export.desc':
    'Download a JSON file with everything: months, expenses, assets, entries, and settings. Save it somewhere safe.',
  'data.export.button': 'Download backup',
  'data.import.title': 'Import from a backup',
  'data.import.desc':
    'Replace everything in this browser with the contents of a backup file. Consider exporting first.',
  'data.import.button': 'Choose file…',
  'data.import.confirm':
    'This will REPLACE all your current data with the contents of the selected file. Continue?',
  'data.import.success': 'Backup imported',
  'data.import.errorInvalid': "That file doesn't look like a valid backup.",
  'data.import.errorRead': 'Could not read the file.',
  'data.preview.months': '{n} months',
  'data.preview.expenses': '{n} expenses',
  'data.preview.assets': '{n} assets',
  'data.preview.assetEntries': '{n} asset entries',
  'data.reset.title': 'Reset everything',
  'data.reset.desc': 'Delete all data in this browser and start fresh. This cannot be undone.',
  'data.reset.button': 'Reset all data',
  'data.reset.confirm': 'Delete ALL data? This cannot be undone.',
  'data.currentSummary': 'Currently stored',
};

const pt: Dict = {
  // App shell
  'app.title': 'Controle Financeiro',
  'app.subtitle': 'Local · Privado',
  'app.footer':
    'Seus dados ficam armazenados localmente no seu navegador. Nada é enviado a lugar algum.',
  'app.buyMeACoffee': 'Me pague um café',
  'app.tab.expenses': 'Despesas',
  'app.tab.wealth': 'Patrimônio',
  'app.language.chooseLabel': 'Idioma',
  'app.theme.label': 'Tema',
  'app.theme.auto': 'Sistema',
  'app.theme.light': 'Claro',
  'app.theme.dark': 'Escuro',

  // Common
  'common.add': 'Adicionar',
  'common.save': 'Salvar',
  'common.saveChanges': 'Salvar alterações',
  'common.cancel': 'Cancelar',
  'common.delete': 'Excluir',
  'common.close': 'Fechar',
  'common.search': 'Buscar…',
  'common.date': 'Data',
  'common.amount': 'Valor',
  'common.description': 'Descrição',
  'common.category': 'Categoria',
  'common.of': 'de',
  'common.percentSuffix': '%',
  'common.years': 'anos',
  'common.month': 'mês',
  'common.months': 'meses',
  'common.optional': '(opcional)',

  // Month navigator
  'monthNav.prev': 'Mês anterior',
  'monthNav.next': 'Próximo mês',
  'monthNav.jumpToday': 'Ir para o mês atual',

  // Budget overview
  'budget.overview': 'Orçamento mensal',
  'budget.remaining': 'Restante',
  'budget.overBy': 'Estouro de',
  'budget.percentUsed': '{n}% usado',
  'budget.percentLeft': '{n}% restante',
  'budget.setSalary': 'Defina seu salário mensal em Configurações',
  'budget.exceeded': 'Você já ultrapassou o orçamento deste mês',
  'budget.settingsButton': 'Orçamento',

  // Category breakdown
  'category.byCategory': 'Por categoria',
  'category.spentVsBudget': 'Gasto vs orçamento por categoria',
  'category.editBudgets': 'Editar orçamentos',
  'category.noneYet': 'Nenhuma categoria ainda. Adicione em Configurações.',

  // Add expense form
  'addExpense.title': 'Adicionar despesa',
  'addExpense.focusPrefix': 'Pressione',
  'addExpense.focusSuffix': 'em qualquer lugar para focar',
  'addExpense.emptySubtitlePrefix': 'Adicione a primeira acima — pressione',
  'addExpense.emptySubtitleSuffix': 'para focar.',
  'addExpense.descPlaceholder': 'ex.: almoço no café',
  'addExpense.noCategories': 'Sem categorias',
  'addExpense.repeatMonthly': 'Repetir mensalmente',
  'addExpense.for': 'Por',
  'addExpense.monthsInclThis': '(incluindo este)',
  'addExpense.indefinitely': 'Indefinidamente',
  'addExpense.submit': 'Adicionar',

  // Expense list
  'expenseList.title': 'Despesas',
  'expenseList.recurringCount': '{n} recorrente',
  'expenseList.allCategories': 'Todas as categorias',
  'expenseList.emptyTitle': 'Nenhuma despesa neste mês ainda',
  'expenseList.noMatches': 'Nenhum resultado para os filtros aplicados.',
  'expenseList.noDescription': 'Sem descrição',
  'expenseList.unknownCategory': 'Categoria desconhecida',
  'expenseList.recurringBadge': 'mensal',
  'expenseList.recurringBadgeIndef': 'mensal · ∞',
  'expenseList.recurringTooltip': 'Recorre mensalmente até {through}',
  'expenseList.recurringTooltipIndef': 'Recorre mensalmente (indefinido)',
  'expenseList.deleteTitle': 'Excluir esta despesa',
  'expenseList.stopRecurrenceTitle': 'Encerrar recorrência',
  'expenseList.stopConfirm':
    'Encerrar esta despesa recorrente? Meses futuros não a incluirão mais. Este mês e os anteriores permanecem.',

  // Budget settings modal
  'budgetSettings.title': 'Configurações de orçamento',
  'budgetSettings.monthlySalary': 'Salário mensal (orçamento)',
  'budgetSettings.salaryHint':
    'Este é o orçamento total do mês. As alterações afetam apenas o mês selecionado.',
  'budgetSettings.categoriesTitle': 'Categorias e orçamentos',
  'budgetSettings.allocated': 'Alocado {amount} de {of}',
  'budgetSettings.overAllocated': '(excedeu em {amount})',
  'budgetSettings.addCategory': 'Adicionar categoria',
  'budgetSettings.noCategories': 'Nenhuma categoria ainda.',
  'budgetSettings.newCategoryName': 'Nova categoria',
  'budgetSettings.categoryNamePlaceholder': 'Nome da categoria',
  'budgetSettings.removeCategoryAria': 'Remover categoria',
  'budgetSettings.changeColorAria': 'Alterar cor',
  'budgetSettings.applyToFuture': 'Aplicar aos meses futuros',
  'budgetSettings.applyToFutureHintNone':
    'Nenhum mês futuro foi aberto ainda — novos meses herdarão esses valores automaticamente.',
  'budgetSettings.applyToFutureHintWith':
    'Sobrescreve salário e orçamentos de categoria em {count} {monthWord} futuros que você já abriu. Categorias que você não tocou lá permanecem intactas.',

  // Toasts
  'toast.added': 'Adicionado {amount}',
  'toast.addedRecurringFor': 'Adicionado {amount} · recorrente por {n} meses',
  'toast.addedRecurringIndef': 'Adicionado {amount} · recorrente mensalmente',
  'toast.stoppedRecurring': 'Recorrência encerrada para meses futuros',
  'toast.budgetUpdated': 'Orçamento atualizado',
  'toast.budgetUpdatedPropagated': 'Orçamento atualizado · propagado para {count} {monthWord} futuros',
  'toast.assetSaved': 'Ativo salvo: {name}',
  'toast.assetDeleted': 'Ativo excluído',
  'toast.entryAdded': '{name}: {amount} adicionado',

  // Wealth
  'wealth.totalPatrimony': 'Patrimônio total',
  'wealth.patrimonyHint': 'Soma dos últimos valores de todos os seus ativos.',
  'wealth.projectedIn': 'Projetado em {years}a',
  'wealth.projectedGain': '+{gain} vs hoje',
  'wealth.projectedNote':
    'Usa o horizonte máximo entre as projeções ativas. Ativos sem projeção permanecem constantes.',
  'wealth.currentTotal': 'Hoje',
  'wealth.card.noSnapshots': 'Sem registros ainda',
  'wealth.card.noVests': 'Sem entradas ainda',
  'wealth.card.snapshotCount': '{n} registros',
  'wealth.card.entriesCount': '{n} entradas',

  // Assets
  'assets.emptyTitle': 'Nenhum ativo ainda',
  'assets.emptySubtitle':
    'Adicione seu primeiro ativo — um ETF, poupança, RSUs, títulos, imóveis, qualquer coisa que você queira acompanhar.',
  'assets.addAsset': 'Adicionar ativo',
  'assets.editAsset': 'Editar ativo',
  'assets.deleteAsset': 'Excluir ativo',
  'assets.createAsset': 'Criar ativo',
  'assets.deleteConfirm':
    'Excluir "{name}" e seus {count} lançamentos? Isso não pode ser desfeito.',
  'assets.field.name': 'Nome',
  'assets.field.namePlaceholder': 'ex.: ETF S&P 500, Reserva de emergência, RSUs da empresa',
  'assets.field.type': 'Tipo',
  'assets.field.currency': 'Moeda',
  'assets.field.color': 'Cor',
  'assets.field.icon': 'Ícone',
  'assets.type.snapshot': 'Snapshot',
  'assets.type.snapshotHint':
    'Registre o valor atual em uma data. Último registro = saldo atual. Use para ETFs, poupança, títulos.',
  'assets.type.cumulative': 'Cumulativo',
  'assets.type.cumulativeHint':
    'Cada entrada soma ao total. Use para vestings de RSU, aportes pontuais, bonificações.',
  'assets.projection.enabled': 'Incluir projeção',
  'assets.projection.hint': 'Projeta o crescimento a partir do último registro',
  'assets.rate.header': 'Taxa {from} → {to}:',
  'assets.rate.note':
    '{name} é rastreado em {currency}. Esta taxa o converte para {app} no total do patrimônio.',
  'assets.rate.approxConverted': '≈ {converted} a 1 {from} = {rate} {to}',
  'assets.section.currentValue': 'Valor atual',
  'assets.section.totalRecorded': 'Total acumulado',
  'assets.section.asOf': 'Em {date}',
  'assets.section.sinceFirst': 'Desde o primeiro registro',
  'assets.section.from': 'De {date}',
  'assets.section.projectedIn': 'Projetado em {years}a',
  'assets.section.projectedHint': '+{gain} a {rate}%/ano',
  'assets.section.projectedHintContrib': '+{gain} a {rate}%/ano + {contrib}/mês',
  'assets.section.entriesCount': '{n} entradas · média {avg}',
  'assets.section.emptyHint': 'Adicione sua primeira entrada abaixo para começar.',
  'assets.form.snapshot.title': 'Registrar valor',
  'assets.form.snapshot.amount': 'Valor atual',
  'assets.form.snapshot.submit': 'Salvar registro',
  'assets.form.snapshot.hint': 'O valor total de {name} nesta data',
  'assets.form.cumulative.title': 'Registrar entrada',
  'assets.form.cumulative.amount': 'Valor',
  'assets.form.cumulative.submit': 'Salvar entrada',
  'assets.form.cumulative.hint': 'O valor adicionado a {name} neste evento',
  'assets.history.snapshot': 'Histórico de registros',
  'assets.history.cumulative': 'Histórico de entradas',
  'assets.history.empty': 'Nenhuma entrada ainda. Adicione uma acima para começar.',

  // Projection (reused for asset settings)
  'projection.annualReturn': 'Retorno anual esperado',
  'projection.monthlyContribution': 'Aporte mensal',
  'projection.horizon': 'Horizonte da projeção',

  // Chart
  'chart.actual': 'Real',
  'chart.projection': 'Projeção',
  'chart.cumulative': 'Acumulado',
  'chart.emptyState': 'Adicione sua primeira entrada para ver o gráfico.',

  // AddEntryForm shared strings
  'entryForm.deleteAria': 'Excluir entrada',
  'entryHistory.mostRecentFirst': 'Mais recentes primeiro',
  'entryHistory.deltaVsPrev': '{delta} vs anterior',
  'entryHistory.totalAfter': 'Total após esta: {total}',

  // Data / backup
  'data.header': 'Dados',
  'data.modal.title': 'Dados e backups',
  'data.export.title': 'Exportar backup',
  'data.export.desc':
    'Baixe um arquivo JSON com tudo: meses, despesas, ativos, entradas e configurações. Guarde em um local seguro.',
  'data.export.button': 'Baixar backup',
  'data.import.title': 'Importar de um backup',
  'data.import.desc':
    'Substitui tudo neste navegador pelo conteúdo do arquivo de backup. Considere exportar antes.',
  'data.import.button': 'Escolher arquivo…',
  'data.import.confirm':
    'Isso vai SUBSTITUIR todos os seus dados atuais pelo conteúdo do arquivo selecionado. Continuar?',
  'data.import.success': 'Backup importado',
  'data.import.errorInvalid': 'Este arquivo não parece ser um backup válido.',
  'data.import.errorRead': 'Não foi possível ler o arquivo.',
  'data.preview.months': '{n} meses',
  'data.preview.expenses': '{n} despesas',
  'data.preview.assets': '{n} ativos',
  'data.preview.assetEntries': '{n} entradas de ativos',
  'data.reset.title': 'Resetar tudo',
  'data.reset.desc':
    'Apaga todos os dados deste navegador e recomeça do zero. Não pode ser desfeito.',
  'data.reset.button': 'Resetar todos os dados',
  'data.reset.confirm': 'Apagar TODOS os dados? Isso não pode ser desfeito.',
  'data.currentSummary': 'Armazenado atualmente',
};

export const TRANSLATIONS: Record<Language, Dict> = { en, 'pt-BR': pt };

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const raw = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  return interpolate(raw, params);
}
