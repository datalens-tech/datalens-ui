export enum Feature {
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    AsideHeaderEnabled = 'AsideHeaderEnabled',
    /** Enable redesign of dash controls */
    DashFloatControls = 'DashFloatControls',
    FieldEditorDocSection = 'FieldEditorDocSection',
    UsePublicDistincts = 'UsePublicDistincts',
    EnablePublishEntry = 'EnablePublishEntry',
    EnableChartEditorDocs = 'EnableChartEditorDocs',
    EnableSaveAsEditorScript = 'EnableSaveAsEditorScript',
    EnableCustomMonitoring = 'EnableCustomMonitoring',
    EnableDashChartStat = 'EnableDashChartStat',
    EnableAutocreateDataset = 'EnableAutocreateDataset',
    ShowCreateEntryWithMenu = 'ShowCreateEntryWithMenu',
    RevisionsListNoLimit = 'RevisionsListNoLimit',
    AuthUpdateWithTimeout = 'AuthUpdateWithTimeout',
    UseComponentHeader = 'UseComponentHeader',
    FetchDocumentation = 'FetchDocumentation',
    Comments = 'Comments',
    EmptySelector = 'emptySelector',
    // Check access rights when processing ChartEditor charts
    ChartEditorDeveloperModeCheck = 'ChartEditorDeveloperModeCheck',
    QLPrometheus = 'QLPrometheus',
    QLMonitoring = 'QLMonitoring',
    CollectionsEnabled = 'CollectionsEnabled',
    CollectionsAccessEnabled = 'CollectionsAccessEnabled',
    DashBoardAccessDescription = 'DashBoardAccessDescription',
    DashBoardSupportDescription = 'DashBoardSupportDescription',
    // Show request body in the Inspector dialog
    ShowInspectorDetails = 'ShowInspectorDetails',
    // Prohibiting the serialization of functions in the chart configs
    NoJsonFn = 'NoJsonFn',
    DatasetsRLS = 'DatasetsRLS',
    // The ability to upload xlsx files for file connections
    XlsxFilesEnabled = 'XlsxFilesEnabled',
    XlsxChartExportEnabled = 'XlsxChartExportEnabled',
    HolidaysOnChart = 'HolidaysOnChart',
    ReadOnlyMode = 'ReadOnlyMode',
    MenuItemsFlatView = 'MenuItemsFlatView',
    EntryMenuItemCopy = 'EntryMenuItemCopy',
    EntryMenuItemMove = 'EntryMenuItemMove',
    ExternalSelectors = 'ExternalSelectors',
    DashBoardWidgetParamsStrictValidation = 'DashBoardWidgetParamsStrictValidation',
    D3Visualizations = 'D3Visualizations',
    HideMultiDatasets = 'HideMultiDatasets',
    ShouldCheckEditorAccess = 'ShouldCheckEditorAccess',
    HideMultitenant = 'HideMultitenant',
    EnableMobileHeader = 'EnableMobileHeader',
    UseYqlFolderKey = 'UseYqlFolderKey',
    ShowChartsEngineDebugInfo = 'ShowChartsEngineDebugInfo',
    UseChartsEngineResponseConfig = 'UseChartsEngineResponseConfig',
    UseChartsEngineLogin = 'UseChartsEngineLogin',
    CopyEntriesToWorkbook = 'CopyEntriesToWorkbook',
    QlAutoExecuteMonitoringChart = 'QlAutoExecuteMonitoringChart',
    MultipleColorsInVisualization = 'MultipleColorsInVisualization',
    ConnectionBasedControl = 'ConnectionBasedControl',
    EnableServerlessEditor = 'EnableServerlessEditor',
    EnableFooter = 'EnableFooter',
    MassRemoveCollectionsWorkbooks = 'MassRemoveCollectionsWorkbooks',
    EnableEmbedsInDialogShare = 'EnableEmbedsInDialogShare',
    EnableEntryMenuItemShare = 'EnableEntryMenuItemShare',
    NewTableWidgetForCE = 'NewTableWidgetForCE',
    /** Additional chart config for making requests by widget events */
    ChartActions = 'ChartActions',
    /** Disable the use of html and function in chart configs */
    DisableFnAndHtml = 'DisableFnAndHtml',
    /** Enable using of presigned urls for uploading files to S3 */
    EnableFileUploadingByPresignedUrl = 'EnableFileUploadingByPresignedUrl',
    /** Enables export menu item for downloading workbook config and import button
     * when creating a workbook */
    EnableExportWorkbookFile = 'EnableExportWorkbookFile',
    /** Enable using RLS v2 config for datasets */
    EnableRLSV2 = 'EnableRLSV2',
    /* Enable Dash server entry validation */
    DashServerValidationEnable = 'DashServerValidationEnable',
    /* Enable Dash server entry migrations */
    DashServerMigrationEnable = 'DashServerMigrationEnable',
    /** Enable custom dashboard gaps */
    EnableCustomDashMargins = 'EnableCustomDashMargins',
    /** Enabled Dash elements auto-focus */
    EnableDashAutoFocus = 'EnableDashAutoFocus',
    /** Enable using template params in datasets sources */
    EnableDsTemplateParams = 'EnableDsTemplateParams',
    /** Enable public gallery unit */
    EnablePublicGallery = 'EnablePublicGallery',
    /** Enable new secure parameters behavior */
    EnableSecureParamsV2 = 'EnableSecureParamsV2',
    /** Enable export settings in connections & datasets */
    EnableExportSettings = 'EnableExportSettings',
    /** Enable updating dataset settings by action ('load_preview_by_default' | 'template_enabled' | 'data_export_forbidden') */
    EnableUpdatingDsSettingsByAction = 'EnableUpdatingDsSettingsByAction',
    /** Enable new favicon, icon, theme, decorations and illustrations */
    EnableDLRebranding = 'EnableDLRebranding',
    /** Add "auto" palette to the list. If enabled, "auto" is parsed to the value of the tenant settings, otherwise to the default palette. */
    EnableTenantSettingPalettes = 'EnableTenantSettingPalettes',
    /** TODO: delete */
    GravityAsDefaultWizardVisualizationLibrary = 'GravityAsDefaultWizardVisualizationLibrary',
    /** Use GravityUI Charts as the default library for some wizard visualizations(pie, donut, treemap) */
    GravityChartsForPieAndTreemap = 'GravityChartsForPieAndTreemap',
    /** Use GravityUI Charts as the default library for some wizard visualizations(scatter and bar-y) */
    GravityChartsForBarYAndScatter = 'GravityChartsForBarYAndScatter',
    /** Enable public api route in api AppMode */
    PublicApi = 'PublicApi',
    /** Enable public api swagger */
    PublicApiSwagger = 'PublicApiSwagger',
}

export type FeatureConfig = Record<string, boolean>;
