export enum Feature {
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    Ql = 'ql',
    HideOldRelations = 'hideOldRelations',
    AsideHeaderEnabled = 'AsideHeaderEnabled',
    FieldEditorDocSection = 'FieldEditorDocSection',
    UsePublicDistincts = 'UsePublicDistincts',
    EnablePublishEntry = 'EnablePublishEntry',
    EnableChartEditorDocs = 'EnableChartEditorDocs',
    EnableSaveAsEditorScript = 'EnableSaveAsEditorScript',
    EnableCustomMonitoring = 'EnableCustomMonitoring',
    ShowActionPanelTreeSelect = 'ShowActionPanelTreeSelect',
    EnableDashChartStat = 'EnableDashChartStat',
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
    MultipleColorsInVisualization = 'MultipleColorsInVisualization',
    ConnectionBasedControl = 'ConnectionBasedControl',
    EnableServerlessEditor = 'EnableServerlessEditor',
    /** New Table plugin for wizard and QL(flat tables only). */
    NewTablePluginForWizardAndQl = 'NewTablePluginForWizardAndQl',
    /** New Table plugin for wizard and QL(pivot tables). */
    NewPluginForPivotTables = 'NewPluginForPivotTables',
    ChartWithFnLogging = 'ChartWithFnLogging',
    PinnedColumns = 'PinnedColumns',
    PinnedColumnsForPivotTables = 'PinnedColumnsForPivotTables',
    EnableFooter = 'EnableFooter',
    /** Enable Isolated VM Sandbox */
    EnableIsolatedSandbox = 'EnableIsolatedSandbox',
    MassRemoveCollectionsWorkbooks = 'MassRemoveCollectionsWorkbooks',
    /** Disable setting min-height: unset for all embedded dashes by default. Enbale min-height: unset only on message event with EMBEDDED_DASH_MESSAGE_NAME */
    RemoveEmbedUnsetDashHeight = 'RemoveEmbedUnsetDashHeight',
    /* Enable dashboard fixed header */
    EnableDashFixedHeader = 'EnableDashFixedHeader',
    /** Use BI handles for getting oauth applications tokens */
    EnableBIOAuth = 'EnableBIOAuth',
    NewSandbox_100p = 'NewSandbox_100p',
    SandboxEngineSelectSwitch = 'SandboxEngineSelectSwitch',
    EnableEmbedsInDialogShare = 'EnableEmbedsInDialogShare',
    EnableEntryMenuItemShare = 'EnableEntryMenuItemShare',
}

export type FeatureConfig = Record<string, boolean>;
