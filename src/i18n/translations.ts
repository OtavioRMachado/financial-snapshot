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
  'app.settings.label': 'Settings',
  'expenses.showBreakdown': 'Show breakdown',
  'expenses.hideBreakdown': 'Hide breakdown',

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

  // Year navigator + view
  'yearNav.prev': 'Previous year',
  'yearNav.next': 'Next year',
  'yearNav.jumpToday': 'Jump to current year',
  'view.month': 'Month',
  'view.year': 'Year',
  'yearView.totalExpenses': 'Total expenses',
  'yearView.totalIncome': 'Total income',
  'yearView.net': 'Net',
  'yearView.netPositive': 'You saved this year',
  'yearView.netNegative': 'You spent more than you earned',
  'yearView.byMonth': 'By month',
  'yearView.byCategory': 'By category',
  'yearView.expenses': 'Expenses',
  'yearView.income': 'Income',
  'yearView.noData': 'No expenses recorded in this year yet.',
  'yearView.ofBudget': 'of yearly budget',

  // CSV import
  'csv.title': 'Import from CSV',
  'csv.subtitle': 'Bulk import expenses from a bank statement or spreadsheet.',
  'csv.button': 'Import CSV',
  'csv.chooseFile': 'Choose CSV file…',
  'csv.instructions': 'Upload a CSV with columns: date, amount, description, category.',
  'csv.formatNote':
    'Accepts YYYY-MM-DD or DD/MM/YYYY dates. Negative amounts are treated as income. Rows sync to the month of each date.',
  'csv.previewTitle': 'Preview ({n} rows)',
  'csv.andMore': '… and {n} more rows',
  'csv.defaultCategory': 'Default category',
  'csv.defaultCategoryHint':
    'Used when a row has no category name, or the name doesn’t match an existing category in the target month.',
  'csv.imported': 'Imported {n} rows',
  'csv.importCount': 'Import {n} rows',
  'csv.errorEmpty': 'The file is empty.',
  'csv.errorNoValid': 'No valid rows found. Check the date and amount columns.',
  'csv.errorParse': 'Could not parse the file.',
  'csv.errorRead': 'Could not read the file.',

  // Budget overview
  'budget.overview': 'Monthly budget',
  'budget.remaining': 'Remaining',
  'budget.overBy': 'Over by',
  'budget.percentUsed': '{n}% used',
  'budget.percentLeft': '{n}% left',
  'budget.income': 'Income',
  'budget.addIncomeHint': 'Add an income entry to set this month\'s budget',
  'budget.exceeded': "You've exceeded this month's budget",
  'budget.settingsButton': 'Budget settings',

  // Category breakdown
  'category.byCategory': 'By category',
  'category.spentVsBudget': 'Spent vs budget for each category',
  'category.editBudgets': 'Edit budgets',
  'category.noneYet': 'No categories yet. Add some in Settings.',
  'category.deltaTooltip': '{pct}% vs previous month',

  // Category pie chart
  'pie.title': 'Spending share by category',
  'pie.titleYear': 'Yearly spending share',
  'pie.subtitle': 'Tap a chip to hide it. Leave one selected to drill into individual expenses.',
  'pie.selectAll': 'All',
  'pie.clearAll': 'None',
  'pie.empty': 'No expense entries yet.',
  'pie.noSelection': 'Select at least one category to see the chart.',
  'pie.total': 'Total',
  'pie.ofTotal': 'of {total}',
  'pie.detailFor': 'Entries in',
  'pie.entryCount': '{n} entries',
  'pie.sortBy': 'Sort:',
  'pie.sortAmount': 'Amount',
  'pie.sortDate': 'Date',

  // Add expense form
  'addExpense.title': 'Add expense',
  'addExpense.titleIncome': 'Add income',
  'addExpense.kindExpense': 'Expense',
  'addExpense.kindIncome': 'Income',
  'addExpense.focusPrefix': 'Press',
  'addExpense.focusSuffix': 'anywhere to focus',
  'addExpense.emptySubtitlePrefix': 'Add your first one above — press',
  'addExpense.emptySubtitleSuffix': 'for a shortcut.',
  'addExpense.descPlaceholder': 'e.g. Lunch at café',
  'addExpense.descPlaceholderIncome': 'e.g. Monthly salary, Freelance payment',
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
  'expenseList.searchAllMonths': 'Search all months',
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
  'budgetSettings.categoriesTitle': 'Categories & budgets',
  'budgetSettings.allocatedTotal': 'Category budgets total: {amount}',
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
  'toast.deleted': 'Deleted',
  'toast.undo': 'Undo',
  'toast.addedRecurringFor': 'Added {amount} · recurring for {n} months',
  'toast.addedRecurringIndef': 'Added {amount} · recurring monthly',
  'toast.stoppedRecurring': 'Stopped recurring expense for future months',
  'toast.budgetUpdated': 'Budget updated',
  'toast.budgetUpdatedPropagated': 'Budget updated · propagated to {count} future {monthWord}',
  'toast.assetSaved': 'Asset saved: {name}',
  'toast.assetDeleted': 'Asset deleted',
  'toast.entryAdded': '{name}: added {amount}',
  'toast.goalSaved': 'Goal saved',

  // FX rates
  'fx.refresh': 'Update FX rates',
  'fx.updating': 'Updating…',
  'fx.updated': 'FX rates updated',
  'fx.error': 'Could not fetch FX rates',
  'fx.errorNoData': 'No matching FX rates returned',
  'fx.lastUpdated': 'Updated {when}',

  // Savings goal
  'goal.emptyTitle': 'Set a savings goal',
  'goal.emptySubtitle': 'Pick a target amount and date; we\'ll track progress.',
  'goal.addAnother': 'Add another goal',
  'goal.newTitle': 'New savings goal',
  'goal.defaultLabel': 'Savings goal',
  'goal.editButton': 'Edit goal',
  'goal.deleteButton': 'Remove goal',
  'goal.deleteConfirm': 'Remove this savings goal?',
  'goal.by': 'By {date}',
  'goal.of': 'of {total}',
  'goal.remaining': '{amount} to go',
  'goal.achieved': 'Goal achieved',
  'goal.daysLeft': '{days} days left',
  'goal.overdue': 'Past target date',
  'goal.needMonthly': 'Need {amount}/mo',
  'goal.field.type': 'Type',
  'goal.field.label': 'Label (optional)',
  'goal.field.labelPlaceholder': 'e.g. House down payment, Sabbatical',
  'goal.field.amount': 'Target amount',
  'goal.field.date': 'Target date',
  'goal.field.contributions': 'Contributing assets',
  'goal.field.estimatedReach': 'Estimated reach date',
  'goal.reach.hint':
    'Computed from your contributing assets and their projections. Update your projections to change this.',
  'goal.reach.by': 'Reaches by {date}',
  'goal.reach.notReachable': 'Not reachable with current projections',
  'goal.reach.achieved': 'Already reached',
  'goal.note': 'Progress is measured against your total patrimony (all assets converted to the app currency).',
  'goal.contributingCount': '{n} assets',
  'goal.type.amount': 'Amount',
  'goal.type.amountHint': 'A specific number by a date — e.g. home down payment.',
  'goal.type.fire': 'FIRE',
  'goal.type.fireHint': 'Financial Independence. Compute or enter a target.',
  'goal.contributions.customize': 'Pick specific assets',
  'goal.contributions.defaultHint':
    'By default all assets contribute 100%. Toggle on to pick specific ones or partial contributions.',
  'goal.contributions.customHint':
    'Only the assets you enable count toward this goal, at the % you set.',
  'goal.contributions.noAssets': 'Add an asset first to customize contributions.',

  // FIRE
  'fire.variantLabel': 'FIRE variant',
  'fire.variant.regular': 'Regular',
  'fire.variant.coast': 'Coast',
  'fire.variant.barista': 'Barista',
  'fire.variantHint.regular': 'Traditional FIRE: your portfolio × safe withdrawal rate covers annual expenses.',
  'fire.variantHint.coast': 'Enough today so growth alone reaches full FIRE by your retirement age. No further contributions needed.',
  'fire.variantHint.barista': 'A smaller number where part-time income covers some expenses and the portfolio covers the rest.',
  'fire.useManual': "I already know my FIRE number, let me type it in",
  'fire.manualAmount': 'FIRE number',
  'fire.annualExpenses': 'Annual expenses',
  'fire.annualExpensesHint': 'What you expect to spend per year in retirement.',
  'fire.swr': 'Safe withdrawal rate',
  'fire.swrHint': 'The % of your portfolio you can withdraw yearly. 4% is the traditional default.',
  'fire.currentAge': 'Current age',
  'fire.retirementAge': 'Retirement age',
  'fire.realReturn': 'Real annual return',
  'fire.realReturnHint': 'Expected return after inflation.',
  'fire.partTimeIncome': 'Annual part-time income',
  'fire.partTimeIncomeHint': 'What you expect to earn from your part-time work.',
  'fire.computedTarget': 'Your FIRE number',

  // Patrimony projection chart
  'patrimonyProjection.title': 'Patrimony over time',
  'patrimonyProjection.subtitle': 'Combined projection across all your assets.',
  'patrimonyProjection.label': 'Patrimony',
  'patrimonyProjection.in': 'In {years}y',

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
  'chart.zoomIn': 'Zoom in',
  'chart.zoomOut': 'Zoom out',
  'chart.resetZoom': 'Reset zoom',

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

  // Encrypted backups
  'data.encrypt.encryptCheckbox': 'Encrypt this backup with a password',
  'data.encrypt.password': 'Password',
  'data.encrypt.passwordPlaceholder': 'Choose a strong password',
  'data.encrypt.passwordHint':
    'Minimum 8 characters. If you lose this password nobody — including me — can recover the backup.',
  'data.encrypt.passwordTooShort': 'Password must be at least 8 characters.',
  'data.encrypt.exportButton': 'Download encrypted backup',
  'data.encrypt.detectedEncrypted': 'This backup is encrypted. Enter the password:',
  'data.encrypt.decryptButton': 'Decrypt and import',
  'data.encrypt.decrypting': 'Decrypting…',
  'data.encrypt.wrongPassword': 'Wrong password (or the file is not a valid encrypted backup).',
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
  'app.settings.label': 'Preferências',
  'expenses.showBreakdown': 'Mostrar detalhes',
  'expenses.hideBreakdown': 'Ocultar detalhes',

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

  // Year navigator + view
  'yearNav.prev': 'Ano anterior',
  'yearNav.next': 'Próximo ano',
  'yearNav.jumpToday': 'Ir para o ano atual',
  'view.month': 'Mês',
  'view.year': 'Ano',
  'yearView.totalExpenses': 'Total de despesas',
  'yearView.totalIncome': 'Total de receitas',
  'yearView.net': 'Saldo',
  'yearView.netPositive': 'Você poupou este ano',
  'yearView.netNegative': 'Você gastou mais do que ganhou',
  'yearView.byMonth': 'Por mês',
  'yearView.byCategory': 'Por categoria',
  'yearView.expenses': 'Despesas',
  'yearView.income': 'Receitas',
  'yearView.noData': 'Nenhuma despesa registrada neste ano ainda.',
  'yearView.ofBudget': 'do orçamento anual',

  // CSV import
  'csv.title': 'Importar de CSV',
  'csv.subtitle': 'Importe várias despesas de um extrato bancário ou planilha.',
  'csv.button': 'Importar CSV',
  'csv.chooseFile': 'Escolher arquivo CSV…',
  'csv.instructions': 'Envie um CSV com colunas: data, valor, descrição, categoria.',
  'csv.formatNote':
    'Aceita datas AAAA-MM-DD ou DD/MM/AAAA. Valores negativos são tratados como receita. Linhas vão para o mês correspondente à data.',
  'csv.previewTitle': 'Prévia ({n} linhas)',
  'csv.andMore': '… e mais {n} linhas',
  'csv.defaultCategory': 'Categoria padrão',
  'csv.defaultCategoryHint':
    'Usada quando a linha não tem categoria ou o nome não corresponde a uma categoria existente no mês de destino.',
  'csv.imported': '{n} linhas importadas',
  'csv.importCount': 'Importar {n} linhas',
  'csv.errorEmpty': 'O arquivo está vazio.',
  'csv.errorNoValid': 'Nenhuma linha válida. Verifique as colunas de data e valor.',
  'csv.errorParse': 'Não foi possível analisar o arquivo.',
  'csv.errorRead': 'Não foi possível ler o arquivo.',

  // Budget overview
  'budget.overview': 'Orçamento mensal',
  'budget.remaining': 'Restante',
  'budget.overBy': 'Estouro de',
  'budget.percentUsed': '{n}% usado',
  'budget.percentLeft': '{n}% restante',
  'budget.income': 'Receita',
  'budget.addIncomeHint': 'Adicione uma receita para definir o orçamento deste mês',
  'budget.exceeded': 'Você já ultrapassou o orçamento deste mês',
  'budget.settingsButton': 'Orçamento',

  // Category breakdown
  'category.byCategory': 'Por categoria',
  'category.spentVsBudget': 'Gasto vs orçamento por categoria',
  'category.editBudgets': 'Editar orçamentos',
  'category.noneYet': 'Nenhuma categoria ainda. Adicione em Configurações.',
  'category.deltaTooltip': '{pct}% vs mês anterior',

  // Category pie chart
  'pie.title': 'Participação de gastos por categoria',
  'pie.titleYear': 'Participação de gastos anual',
  'pie.subtitle':
    'Toque em uma etiqueta para ocultá-la. Deixe apenas uma para ver os lançamentos.',
  'pie.selectAll': 'Todas',
  'pie.clearAll': 'Nenhuma',
  'pie.empty': 'Nenhum lançamento de despesa ainda.',
  'pie.noSelection': 'Selecione ao menos uma categoria para ver o gráfico.',
  'pie.total': 'Total',
  'pie.ofTotal': 'de {total}',
  'pie.detailFor': 'Lançamentos em',
  'pie.entryCount': '{n} lançamentos',
  'pie.sortBy': 'Ordenar:',
  'pie.sortAmount': 'Valor',
  'pie.sortDate': 'Data',

  // Add expense form
  'addExpense.title': 'Adicionar despesa',
  'addExpense.titleIncome': 'Adicionar receita',
  'addExpense.kindExpense': 'Despesa',
  'addExpense.kindIncome': 'Receita',
  'addExpense.focusPrefix': 'Pressione',
  'addExpense.focusSuffix': 'em qualquer lugar para focar',
  'addExpense.emptySubtitlePrefix': 'Adicione a primeira acima — pressione',
  'addExpense.emptySubtitleSuffix': 'para focar.',
  'addExpense.descPlaceholder': 'ex.: almoço no café',
  'addExpense.descPlaceholderIncome': 'ex.: salário mensal, pagamento freelance',
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
  'expenseList.searchAllMonths': 'Buscar em todos os meses',
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
  'budgetSettings.categoriesTitle': 'Categorias e orçamentos',
  'budgetSettings.allocatedTotal': 'Soma dos orçamentos por categoria: {amount}',
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
  'toast.deleted': 'Excluído',
  'toast.undo': 'Desfazer',
  'toast.addedRecurringFor': 'Adicionado {amount} · recorrente por {n} meses',
  'toast.addedRecurringIndef': 'Adicionado {amount} · recorrente mensalmente',
  'toast.stoppedRecurring': 'Recorrência encerrada para meses futuros',
  'toast.budgetUpdated': 'Orçamento atualizado',
  'toast.budgetUpdatedPropagated': 'Orçamento atualizado · propagado para {count} {monthWord} futuros',
  'toast.assetSaved': 'Ativo salvo: {name}',
  'toast.assetDeleted': 'Ativo excluído',
  'toast.entryAdded': '{name}: {amount} adicionado',
  'toast.goalSaved': 'Meta salva',

  // FX rates
  'fx.refresh': 'Atualizar câmbio',
  'fx.updating': 'Atualizando…',
  'fx.updated': 'Câmbio atualizado',
  'fx.error': 'Não foi possível buscar o câmbio',
  'fx.errorNoData': 'Nenhum câmbio correspondente retornado',
  'fx.lastUpdated': 'Atualizado em {when}',

  // Savings goal
  'goal.emptyTitle': 'Definir uma meta',
  'goal.emptySubtitle': 'Escolha um valor e data; acompanhamos o progresso.',
  'goal.addAnother': 'Adicionar outra meta',
  'goal.newTitle': 'Nova meta de poupança',
  'goal.defaultLabel': 'Meta de poupança',
  'goal.editButton': 'Editar meta',
  'goal.deleteButton': 'Remover meta',
  'goal.deleteConfirm': 'Remover esta meta?',
  'goal.by': 'Até {date}',
  'goal.of': 'de {total}',
  'goal.remaining': 'faltam {amount}',
  'goal.achieved': 'Meta atingida',
  'goal.daysLeft': '{days} dias restantes',
  'goal.overdue': 'Data ultrapassada',
  'goal.needMonthly': 'Precisa de {amount}/mês',
  'goal.field.type': 'Tipo',
  'goal.field.label': 'Rótulo (opcional)',
  'goal.field.labelPlaceholder': 'ex.: entrada casa, sabático',
  'goal.field.amount': 'Valor alvo',
  'goal.field.date': 'Data alvo',
  'goal.field.contributions': 'Ativos contribuintes',
  'goal.field.estimatedReach': 'Data estimada para atingir',
  'goal.reach.hint':
    'Calculado a partir dos ativos contribuintes e suas projeções. Ajuste as projeções para mudar isso.',
  'goal.reach.by': 'Atinge até {date}',
  'goal.reach.notReachable': 'Não atingível com as projeções atuais',
  'goal.reach.achieved': 'Já atingido',
  'goal.note': 'O progresso é medido em relação ao seu patrimônio total (todos os ativos convertidos para a moeda do app).',
  'goal.contributingCount': '{n} ativos',
  'goal.type.amount': 'Valor',
  'goal.type.amountHint': 'Um número específico até uma data — ex.: entrada de imóvel.',
  'goal.type.fire': 'FIRE',
  'goal.type.fireHint': 'Independência financeira. Calcule ou informe um número.',
  'goal.contributions.customize': 'Selecionar ativos específicos',
  'goal.contributions.defaultHint':
    'Por padrão todos os ativos contribuem 100%. Marque para escolher ativos ou contribuições parciais.',
  'goal.contributions.customHint':
    'Apenas os ativos habilitados contam para esta meta, no % que você definir.',
  'goal.contributions.noAssets': 'Adicione um ativo antes de personalizar contribuições.',

  // FIRE
  'fire.variantLabel': 'Variante do FIRE',
  'fire.variant.regular': 'Regular',
  'fire.variant.coast': 'Coast',
  'fire.variant.barista': 'Barista',
  'fire.variantHint.regular': 'FIRE tradicional: sua carteira × taxa de retirada segura cobre suas despesas anuais.',
  'fire.variantHint.coast': 'Quantia hoje suficiente para o crescimento sozinho chegar ao FIRE completo até sua aposentadoria. Sem novos aportes.',
  'fire.variantHint.barista': 'Um número menor onde a renda parcial cobre parte das despesas e a carteira cobre o resto.',
  'fire.useManual': 'Já sei meu número de FIRE, deixe-me digitar',
  'fire.manualAmount': 'Número FIRE',
  'fire.annualExpenses': 'Despesas anuais',
  'fire.annualExpensesHint': 'Quanto você espera gastar por ano na aposentadoria.',
  'fire.swr': 'Taxa de retirada segura',
  'fire.swrHint': 'A % da carteira que você pode sacar por ano. 4% é o padrão tradicional.',
  'fire.currentAge': 'Idade atual',
  'fire.retirementAge': 'Idade de aposentadoria',
  'fire.realReturn': 'Retorno anual real',
  'fire.realReturnHint': 'Retorno esperado descontada a inflação.',
  'fire.partTimeIncome': 'Renda anual parcial',
  'fire.partTimeIncomeHint': 'Quanto você espera ganhar com trabalho parcial.',
  'fire.computedTarget': 'Seu número FIRE',

  // Patrimony projection chart
  'patrimonyProjection.title': 'Patrimônio ao longo do tempo',
  'patrimonyProjection.subtitle': 'Projeção combinada de todos os seus ativos.',
  'patrimonyProjection.label': 'Patrimônio',
  'patrimonyProjection.in': 'Em {years}a',

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
  'chart.zoomIn': 'Aproximar',
  'chart.zoomOut': 'Afastar',
  'chart.resetZoom': 'Restaurar zoom',

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

  // Encrypted backups
  'data.encrypt.encryptCheckbox': 'Criptografar este backup com senha',
  'data.encrypt.password': 'Senha',
  'data.encrypt.passwordPlaceholder': 'Escolha uma senha forte',
  'data.encrypt.passwordHint':
    'Mínimo 8 caracteres. Se você perder a senha, ninguém — nem eu — pode recuperar o backup.',
  'data.encrypt.passwordTooShort': 'A senha deve ter pelo menos 8 caracteres.',
  'data.encrypt.exportButton': 'Baixar backup criptografado',
  'data.encrypt.detectedEncrypted': 'Este backup está criptografado. Digite a senha:',
  'data.encrypt.decryptButton': 'Descriptografar e importar',
  'data.encrypt.decrypting': 'Descriptografando…',
  'data.encrypt.wrongPassword': 'Senha incorreta (ou o arquivo não é um backup criptografado válido).',
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
