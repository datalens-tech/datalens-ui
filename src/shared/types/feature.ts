export enum Feature {
    ChartkitAlerts = 'chartkitAlerts',
    UseConfigurableChartkit = 'UseConfigurableChartkit',
    HideOldRelations = 'hideOldRelations',
    // Show new relations button in navigation action panel
    ShowNewRelationsButton = 'ShowNewRelationsButton',
    AsideHeaderEnabled = 'AsideHeaderEnabled',
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
    DashAutorefresh = 'DashAutorefresh',
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
    UseGrpcOptions = 'UseGrpcOptions',
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
    /** Enable undo/redo buttons & hotkeys in datasets */
    EnableEditHistoryDatasets = 'EnableEditHistoryDataset',
    /** Depends on US feature UseMovePermAction.
     * It checks admin permission for move entries instead of edit permission.
     */
    UseMovePermAction = 'UseMovePermAction',
    /** An empty chart for drawing something unusual */
    BlankChart = 'BlankChart',
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
}

export type FeatureConfig = Record<string, boolean>;
