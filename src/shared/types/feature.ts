export enum Feature {
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    Ql = 'ql',
    ShowNewRelations = 'showNewRelations',
    HideOldRelations = 'hideOldRelations',
    AsideHeaderEnabled = 'AsideHeaderEnabled',
    FieldEditorDocSection = 'FieldEditorDocSection',
    UsePublicDistincts = 'UsePublicDistincts',
    EnablePublishEntry = 'EnablePublishEntry',
    EnableChartEditor = 'EnableChartEditor',
    EnableChartEditorDocs = 'EnableChartEditorDocs',
    EnableSaveAsEditorScript = 'EnableSaveAsEditorScript',
    EnableCustomMonitoring = 'EnableCustomMonitoring',
    ShowActionPanelTreeSelect = 'ShowActionPanelTreeSelect',
    EnableDashChartStat = 'EnableDashChartStat',
    EnableEditHistory = 'EnableEditHistory',
    EnableShareWidget = 'EnableShareWidget',
    EnableAutocreateDataset = 'EnableAutocreateDataset',
    ShowCreateEntryWithMenu = 'ShowCreateEntryWithMenu',
    RevisionsListNoLimit = 'RevisionsListNoLimit',
    UseNavigation = 'UseNavigation',
    AuthUpdateWithTimeout = 'AuthUpdateWithTimeout',
    UseComponentHeader = 'UseComponentHeader',
    FetchDocumentation = 'FetchDocumentation',
    Comments = 'Comments',
    ShowFilteringChartSetting = 'ShowFilteringChartSetting',
    EmptySelector = 'emptySelector',
    ChartEditorDeveloperModeCheck = 'ChartEditorDeveloperModeCheck',
    QLPrometheus = 'QLPrometheus',
    QLMonitoring = 'QLMonitoring',
    CollectionsEnabled = 'CollectionsEnabled',
    CollectionsAccessEnabled = 'CollectionsAccessEnabled',
    DashBoardAccessDescription = 'DashBoardAccessDescription',
    DashBoardSupportDescription = 'DashBoardSupportDescription',
    DashAutorefresh = 'DashAutorefresh',
    GSheetsV2Enabled = 'GSheetsV2Enabled',
    ShowInspectorDetails = 'ShowInspectorDetails',
    NoJsonFn = 'NoJsonFn',
    GSheetGoogleAuthEnabled = 'GSheetGoogleAuthEnabled',
    CustomColorPalettes = 'CustomColorPalettes',
    DatasetsRLS = 'DatasetsRLS',
    XlsxFilesEnabled = 'XlsxFilesEnabled',
    XlsxChartExportEnabled = 'XlsxChartExportEnabled',
    GroupControls = 'GroupControls',
    EscapeUserHtmlInDefaultHcTooltip = 'EscapeUserHtmlInDefaultHcTooltip',
    HolidaysOnChart = 'HolidaysOnChart',
    PivotTableMeasureNames = 'PivotTableMeasureNames',
    NewMobileDesign = 'NewMobileDesign',
    PivotTableSortWithTotals = 'PivotTableSortWithTotals',
    ReadOnlyMode = 'ReadOnlyMode',
    MenuItemsFlatView = 'MenuItemsFlatView',
    EntryMenuItemCopy = 'EntryMenuItemCopy',
    EntryMenuItemMove = 'EntryMenuItemMove',
    EntryMenuEditor = 'EntryMenuEditor',
    ExternalSelectors = 'ExternalSelectors',
    DashBoardWidgetParamsStrictValidation = 'DashBoardWidgetParamsStrictValidation',
    D3ScatterVisualization = 'D3ScatterVisualization',
    D3PieVisualization = 'D3PieVisualization',
    D3BarXVisualization = 'D3BarXVisualization',
    D3Visualizations = 'D3Visualizations',
    HideMultiDatasets = 'HideMultiDatasets',
    ShouldCheckEditorAccess = 'ShouldCheckEditorAccess',
    HideMultitenant = 'HideMultitenant',
    EnableMobileHeader = 'EnableMobileHeader',
    UseYqlFolderKey = 'UseYqlFolderKey',
    UseGrpcOptions = 'UseGrpcOptions',
    ShowChartsEngineDebugInfo = 'ShowChartsEngineDebugInfo',
    UseChartsEngineResponseConfig = 'UseChartsEngineResponseConfig',
    UseChartsEngineLogin = 'UseChartsEngineLogin',
    AddDemoWorkbook = 'AddDemoWorkbook',
    CopyEntriesToWorkbook = 'CopyEntriesToWorkbook',
    WizardChartChartFilteringAvailable = 'WizardChartChartFilteringAvailable',
    QlAutoExecuteMonitoringChart = 'QlAutoExecuteMonitoringChart',
    EnableFavoritesNameAliases = 'EnableFavoritesNameAliases',
    SelectorRequiredValue = 'SelectorRequiredValue',
    MultipleColorsInVisualization = 'MultipleColorsInVisualization',
    MarkupMetric = 'MarkupMetric',
    ConnectionBasedControl = 'ConnectionBasedControl',
    EnableServerlessEditor = 'EnableServerlessEditor',
    NewTablePluginForWizardAndQl = 'NewTablePluginForWizardAndQl',
    ChartWithFnLogging = 'ChartWithFnLogging',
}

export type FeatureConfig = Record<string, boolean>;
