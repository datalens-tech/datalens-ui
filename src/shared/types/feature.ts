export enum Feature {
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    Ql = 'ql',
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
    DatasetsRLS = 'DatasetsRLS',
    XlsxFilesEnabled = 'XlsxFilesEnabled',
    XlsxChartExportEnabled = 'XlsxChartExportEnabled',
    GroupControls = 'GroupControls',
    EscapeUserHtmlInDefaultHcTooltip = 'EscapeUserHtmlInDefaultHcTooltip',
    HolidaysOnChart = 'HolidaysOnChart',
    ReadOnlyMode = 'ReadOnlyMode',
    MenuItemsFlatView = 'MenuItemsFlatView',
    EntryMenuItemCopy = 'EntryMenuItemCopy',
    EntryMenuItemMove = 'EntryMenuItemMove',
    EntryMenuEditor = 'EntryMenuEditor',
    ExternalSelectors = 'ExternalSelectors',
    DashBoardWidgetParamsStrictValidation = 'DashBoardWidgetParamsStrictValidation',
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
    CopyEntriesToWorkbook = 'CopyEntriesToWorkbook',
    QlAutoExecuteMonitoringChart = 'QlAutoExecuteMonitoringChart',
    EnableFavoritesNameAliases = 'EnableFavoritesNameAliases',
    MultipleColorsInVisualization = 'MultipleColorsInVisualization',
    ConnectionBasedControl = 'ConnectionBasedControl',
    EnableServerlessEditor = 'EnableServerlessEditor',
    NewTablePluginForWizardAndQl = 'NewTablePluginForWizardAndQl',
    ChartWithFnLogging = 'ChartWithFnLogging',
    PinnedColumns = 'PinnedColumns',
    EnableFooter = 'EnableFooter',
    /** Chart runner for the execution of trusted code in wizard/ql. */
    WorkerChartBuilder = 'WorkerChartBuilder',
    /** Enable Isolated VM Sandbox */
    EnableIsolatedSandbox = 'EnableIsolatedSandbox',
    MassRemoveCollectionsWorkbooks = 'MassRemoveCollectionsWorkbooks',
    /** Disable setting min-height: unset for all embedded dashes by default. Enbale min-height: unset only on message event with EMBEDDED_DASH_MESSAGE_NAME */
    RemoveEmbedUnsetDashHeight = 'RemoveEmbedUnsetDashHeight',
    /* Enable dashboard fixed header */
    EnableDashFixedHeader = 'EnableDashFixedHeader',
    /** Use BI handles for getting oauth applications tokens */
    EnableBIOAuth = 'EnableBIOAuth',
    NewSandbox_1p = 'NewSandbox_1p',
    NewSandbox_10p = 'NewSandbox_10p',
    NewSandbox_33p = 'NewSandbox_33p',
    NewSandbox_50p = 'NewSandbox_50p',
    NewSandbox_75p = 'NewSandbox_75p',
    NewSandbox_100p = 'NewSandbox_100p',
    NoErrorTransformer = 'NoErrorTransformer',
}

export type FeatureConfig = Record<string, boolean>;
