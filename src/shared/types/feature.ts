export enum Feature {
    ToggleTheme = 'toggleTheme',
    SuggestEnabled = 'suggestEnabled',
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    Ql = 'ql',
    CrawlerPromo = 'crawlerPromo',
    ShowNewRelations = 'showNewRelations',
    ShowPromoIntro = 'ShowPromoIntro',
    AsideHeaderEnabled = 'AsideHeaderEnabled',
    HelpCenterEnabled = 'HelpCenterEnabled',
    SupportReportEnabled = 'SupportReportEnabled',
    CloudMode = 'CloudMode',
    SwitchInstanceBetweenOrgAndFolder = 'SwitchInstanceBetweenOrgAndFolder',
    FieldEditorDocSection = 'FieldEditorDocSection',
    GlobalScopeSDK = 'GlobalScopeSDK',
    UsePublicDistincts = 'UsePublicDistincts',
    EnablePublishEntry = 'EnablePublishEntry',
    EnableChartEditor = 'EnableChartEditor',
    EnableCustomMonitoring = 'EnableCustomMonitoring',
    ShowActionPanelTreeSelect = 'ShowActionPanelTreeSelect',
    EnableDashChartStat = 'EnableDashChartStat',
    EnableShareWidget = 'EnableShareWidget',
    EnableAutocreateDataset = 'EnableAutocreateDataset',
    ShowCreateEntryWithMenu = 'ShowCreateEntryWithMenu',
    RevisionsListNoLimit = 'RevisionsListNoLimit',
    UseNavigation = 'UseNavigation',
    AuthUpdateWithTimeout = 'AuthUpdateWithTimeout',
    UseComponentHeader = 'UseComponentHeader',
    FetchDocumentation = 'FetchDocumentation',
    InnerDocumentation = 'InnerDocumentation',
    Comments = 'Comments',
    ShowFilteringChartSetting = 'ShowFilteringChartSetting',
    DashBoardGlobalParams = 'dashBoardGlobalParams',
    EmptySelector = 'emptySelector',
    ChartEditorDeveloperModeCheck = 'ChartEditorDeveloperModeCheck',
    StartInDataLens = 'StartInDataLens',
    QLPrometheus = 'QLPrometheus',
    QLMonitoring = 'QLMonitoring',
    GenericDatetime = 'GenericDatetime',
    GenericDatetimeMigration = 'GenericDatetimeMigration',
    MailWelcomeNewUser = 'MailWelcomeNewUser',
    CollectionsEnabled = 'CollectionsEnabled',
    CollectionsAccessEnabled = 'CollectionsAccessEnabled',
    DashBoardAccessDescription = 'DashBoardAccessDescription',
    DashBoardSupportDescription = 'DashBoardSupportDescription',
    DashAutorefresh = 'DashAutorefresh',
    DcAirflowEnabled = 'DcAirflowEnabled',
    DcChartsExtensionEnabled = 'DcChartsExtensionEnabled',
    DcTransferTimelineEnabled = 'DcTransferTimelineEnabled',
    GSheetsV2Enabled = 'GSheetsV2Enabled',
    ShowInspectorDetails = 'ShowInspectorDetails',
    NoJsonFn = 'NoJsonFn',
    GSheetGoogleAuthEnabled = 'GSheetGoogleAuthEnabled',
    CustomColorPalettes = 'CustomColorPalettes',
    BackofficeBanner = 'BackofficeBanner',
    BackofficePromo = 'BackofficePromo',
    WysiwygEditorImageItem = 'WysiwygEditorImageItem',
    DatasetsRLS = 'DatasetsRLS',
    XlsxFilesEnabled = 'XlsxFilesEnabled',
    XlsxChartExportEnabled = 'XlsxChartExportEnabled',
    GroupControls = 'GroupControls',
    UsersInvitation = 'UsersInvitation',
    EscapeUserHtmlInDefaultHcTooltip = 'EscapeUserHtmlInDefaultHcTooltip',
    HolidaysOnChart = 'HolidaysOnChart',
    StatusIllustrations = 'StatusIllustrations',
    PivotTableMeasureNames = 'PivotTableMeasureNames',
    NewMobileDesign = 'NewMobileDesign',
    PivotTableSortWithTotals = 'PivotTableSortWithTotals',
    ReadOnlyMode = 'ReadOnlyMode',
    MenuItemsFlatView = 'MenuItemsFlatView',
    EntryMenuItemCopy = 'EntryMenuItemCopy',
    EntryMenuItemMove = 'EntryMenuItemMove',
    EntryMenuItemAccess = 'EntryMenuItemAccess',
    EntryMenuEditor = 'EntryMenuEditor',
    ExternalSelectors = 'ExternalSelectors',
    MigrateToWorkbookEnabled = 'MigrateToWorkbookEnabled',
    DashBoardWidgetParamsStrictValidation = 'DashBoardWidgetParamsStrictValidation',
    D3ScatterVisualization = 'D3ScatterVisualization',
    D3PieVisualization = 'D3PieVisualization',
    D3BarXVisualization = 'D3BarXVisualization',
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
    SaveDashWithFakeEntry = 'SaveDashWithFakeEntry',
    CopyEntriesToWorkbook = 'CopyEntriesToWorkbook',
    WizardChartChartFilteringAvailable = 'WizardChartChartFilteringAvailable',
}

export type FeatureConfig = Record<string, boolean>;
