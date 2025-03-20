export enum RobotChartsDatasets {
    GeoDatasetTest = 'geo-dataset-test',
    CsvBasedDataset = 'cities-dataset',
    CsvBasedDatasetCopy = 'cities-dataset-copy',
    SampleDs = 'dataset-sample',
    SampleCHDataset = 'sample-csv-dataset',
    CitiesDataset = 'cities-dataset',
    SampleDsWithoutProfit = 'dataset-sample-without-profit',
    BigDataset = 'big-dataset',
    ObligatoryFilterDataset = 'dataset-with-obligatory-filters-duplicate',
    DatasetWithParameters = 'sample-csv-dataset-with-parameters',
    OrderSalesDataset = 'order-sales-ds',
    BirthClientsDataset = 'birth-clients-ds',
}

export enum RobotChartsWizardUrls {
    Empty = '/wizard/',
    WizardWithParameterDataset = '/wizard/?__datasetId=ktrfwixwpwikc',
    WizardCitiesDataset = '/wizard/?__datasetId=uxyjsgrbam4sk',
    WizardForDatasetSampleCh = '/wizard/?__datasetId=bfvw78uczxp65',
    WizardForGeoDataset = '/wizard/?__datasetId=f9v6rrirbjjka',
    WizardWithPseudoFieldsAndHierarchies = '/wizard/9hxcsdcn8fnq3',
    WizardWithDashboardFilters = '/wizard/cyv7bagmagoc6?city_sfqq=Jejsk&Rank=__gt_1',
    WizardWithEmptyDashboardFilter = '/wizard/cyv7bagmagoc6?city_sfqq=',
    WizardWithDatasetIdInUrl = '/wizard/cyv7bagmagoc6?__datasetId=123',
    WizardForBigDataset = '/wizard/?__datasetId=jmm8a13t22zq9',
    CsvBasedDatasetChartWithLocalFields = '/wizard/ylxw00fdc9h4s',
    CsvBasedDatasetChartTable = '/wizard/l8w40qgibm6qb',
    WizardForDatasetWithObligatoryFilters = '/wizard/?__datasetId=kn3x6n22y3aca',

    WizardFlatTable = '/wizard/k4rcsgaigcg2d-e2e-test-wizard-flat-table-chart',
    WizardIndicator = '/wizard/unkj7351khz6j',
    WizardWithLocalParameterChart = '/wizard/py2j397j7zceh',
    WizardWithParameterizedLocalField = '/wizard/oxfd6xn6wrzog',
    WizardTableWithDraftVersion = '/wizard/rllov10zzhpmh',

    PivotTableWithFormattedMeasures = '/wizard/s83mgvpsxtfql',
    PivotTableWithFormattedHeader = '/wizard/n3yn0inzmpagg',
    PivotTableWithFormattedRowHeader = '/wizard/1hc3um8a88x4u',
    PivotTableWithMarkdown = '/wizard/t983myct00xwm',
    PivotTableWithBigHeader = '/wizard/q6571rbunzoij',
    PivotTableWithBigRowHeader = '/wizard/m217zsx53rxuf',

    FlatTableWithTree = '/wizard/a57impj49azu1-e2e-tree-sorting',

    NewChartWithCurrentPath = '/wizard/new?currentPath=Users/robot-charts/yagr',
    WizardForCsvBasedDataset = '/wizard/?__datasetId=uxyjsgrbam4sk',
    WizardForCsvBasedDatasetWithCurrentPath = '/wizard/?__datasetId=uxyjsgrbam4sk&currentPath=Users/robot-charts/yagr',
    WizardWithComments = '/wizard/khbq6k08b8d0a',
    WizardWithNavigator = '/wizard/rth7afdo4zfeh',
    WizardWithOverLimitsChart = '/wizard/mvhpugtqlktcc',
    WizardWithForbiddenExport = '/wizard/ptvmml92bmrse',

    WizardGeopoints = '/wizard/q4zz72oendrgk',
    WizardLabels = '/wizard/ikblc7qjn4reb',
    WizardWithNonExistingDatasetField = '/wizard/adga6jwrwig84',
    WizardUrlOperators = '/wizard/o5319g3u1x4ah-chart-for-url-operators-test',

    WizardWithEditorId = '/wizard/j2ac4oofeuzm9',
    WizardWithSQLId = '/wizard/estm3g44u4g84',

    WizardBasicDataset = '/wizard/?__datasetId=o3qzuaoe5jsud',
}

export enum RobotChartsEditorUrls {
    EditorNew = '/editor/new',
    EditorNewMarkup = '/editor/draft/markup',
    EditorWithWizardId = '/editor/ikblc7qjn4reb',
    EditorWithSQLId = '/editor/estm3g44u4g84',
    InputWithReset = '/editor/gx2pqz0oqtno6',
    SelectWIthReset = '/editor/j292h1eiuv7i9',
    TableAndInputWithReset = '/editor/fx6iv2zoy27i5',
    TableAndSelectWithReset = '/editor/j2ac4oofeuzm9',
    SelectorWithUnreleasedLogic = '/editor/48gkyuz8w9hqt',
    ChartWithForbiddenExport = '/editor/ptvyqpz3oh70e',
}

export enum RobotChartsConnectionUrls {
    PublicPostgresDemo = '/connections/vinixts1o8dip',
}

export enum RobotChartsSQLEditorTitles {
    PublicPostgresDemo = 'Public Postgres Demo',
}

export enum RobotChartsSQLEditorUrls {
    NewQLChartForPostgresDemo = '/ql/?connectionId=vinixts1o8dip',
    NewQLChartForMonitoring = '/ql/?connectionId=sko8xq9yb2yck',
    NewQLChartForCHYTDemo = '/ql/?connectionId=4ztka7stosdow',
    NewQLChart = '/ql',
    QLChartWithIntervalParameter = '/ql/estm3g44u4g84?interval=__between___interval_2023-04-18T00:00:00.000Z_2023-04-21T23:59:59.999Z',
    QLChartWithStringParameter = '/ql/l7j6d6kw8iwyb',
    QLChartWithStringParameterSet = '/ql/l7j6d6kw8iwyb?year=2000',
    QLMonitoringChart = '/ql/juti3rn4g6s88',
    QLWithWizardId = '/ql/ikblc7qjn4reb',
    QLWithEditorId = '/ql/j2ac4oofeuzm9',
}

export enum RobotChartsWizardId {
    Geopoints = 'q4zz72oendrgk',
    WizardLabels = 'ikblc7qjn4reb',
}

export enum RobotChartsDashboardUrls {
    DashnboardWithMarkdown = '/6ahjnlu2jjjmv',
    DashboardWithExternalSelector = '/ucb1f7zpd472n',
    DashboardWithTabsAndSelectors = '/2l2osdmdofoiv',
    DashboardWithDashConnections = '/022pp7sjxryqr',
    DashboardWithManyRevisions = '/og7zg551lf38g',
    DashboardWithOneRevisionOnly = '/jb8nprxpknk2b',
    DashboardWithFewRevision = '/48go2ym9807yt',
    DashboardWithTOC = '/z8ki84prsg0yr',
    DashboardWithDatetimeSelectors = '/aa7p694h9wuy1',
    DashboardWithDescriptionAndNoTabs = '/9sq3yakk6c0c0',
    DashboardWithChartInnerControl = '/bv8xkjv5yeu02', // IMPORTANT - we set the priority of loading "Selectors" on the dashboard
    DashboardLoadPrioritySelectors = '/hcn6krw3iy0q7',
    DashboardLoadPriorityCharts = '/yt4nzjb7cg7go',
    DashboardWithAutoRefreshChartWithComment = '/85014w8vumk0y',
    DashboardWithLongContentBeforeChart = '/qnjlsb2fov8gg',
    DashboardWithLongContentAndBrokenChart = '/3cyhskx3fyd2t',
    DashboardWithWidgetsWithAutoheight = '/a7vvnonakri80',
    DashboardWithGlobalDefaultParams = '/wugv3l70wxhcm',
    DashboardWithEmptyGlobalDefaultParams = '/lj5g6vdkxxrib',
    DashboardWithChartDefaultParams = '/ki4i5aydoduka',
    DashboardWithSelectors = '/w37xj3ev0vm4m',
    DashboardWithSelectorAndAcceptableValues = '/z89u6bqn4o3yp',
    DashboardWithYagrCharts = '/8gvkpbjv3x7wy',
    DashboardWithChartTabsAndRelation = '/lt9uci9co9g2b',
    DashboardWithOverLimitsChart = '/y7t337y87h04o',
    DashboardWithCustomTooltip = '/mrkyzqh950pmb',
    DashboardWithEditorSelectorsWithoutParams = '/saj2by7fkc64i',
    DashboardWithEditorSelectorsWithParams = '/4mwiptdrf4n8u',
    DashboardWithEditorSelectorAndChart = '/7skevi65rzjyx',
    DashboardWithEditorChartWithParams = '/h0w5teta52p86',
}

export enum RobotChartsPreviewUrls {
    PreviewChartWithDate = '/preview/jr7ic9bx6u8u9',
    PreviewChartWithCustomTooltipConfig = '/preview/bg9n2ad5wwio0',
    PreviewChartWithCustomTooltipUpdateConfig = '/preview/pun1u9o84to0e',
    PreviewInputWithReset = '/preview/gx2pqz0oqtno6',
    PreviewSelectWithReset = '/preview/j292h1eiuv7i9',
    PreviewTableAndInputWithReset = '/preview/fx6iv2zoy27i5',
    PreviewTableAndSelectWithReset = '/preview/j2ac4oofeuzm9',
}

export const enum RobotChartsDatasetUrls {
    NewDataset = '/datasets/new',
    DatasetAvatars = '/datasets/nqndej03dswqf',
    DatasetWithParameters = '/datasets/8hell96km86o0',
    DatasetWithAddedParameter = '/datasets/ktrfwixwpwikc',
    DatasetWithDeletedConnection = '/datasets/rupa8kcmvnmil',
    DatasetWithValidationError = '/datasets/mqjnuhmltfs8c',
}

export const mapDatasetToDatasetPath = {
    [RobotChartsDatasets.CitiesDataset]: '/datasets/uxyjsgrbam4sk',
};

export const RobotChartsIds = {
    CHARTS_WITH_TOOLTIPS: [
        'c6szja3hbg2e7', // columnar
        'hbx4u49rqnv8c', // linear
        'pj5c63epjm6wk', // eria
        'gaw4zfnw1ttub', // normalized eria
        'd7t10mjlnkks8', // normalized columnar
        'gaw51gkxs0uib', // linear
        'oi4dd24ocn4ej', // normalized linear
        '5zlux5o14uqg0', // scatter
        'e8u4azq46mr69', // share
        'wqcmwqftjroqr', // trimap
        // 'nh3e6sgyyqu4i', // map (commented out, as it is not clear how to samulate the hover to the polygon in canvas)
    ],
    CHARTS_WITH_CUSTOM_TOOLTIPS: {
        CHART_HIGHCHARTS_CONFIG: 'bg9n2ad5wwio0',
        CHART_HIGHCHARTS_UPDATE_CONFIG: 'pun1u9o84to0e',
    },
};

export const COMMON_SELECTORS = {
    ENTRY_PANEL_MORE_BTN: 'entry-panel-more-btn',
    ACTION_PANEL_DESCRIPTION_BTN: 'action-button-description',
    ACTION_PANEL_CANCEL_BTN: 'action-button-cancel',
    ACTION_PANEL_EDIT_BTN: 'action-button-edit',
    ACTION_PANEL_SAVE_AS_BTN: 'action-button-save-as',
    ACTION_PANEL_SAVE_AS_MENU: 'action-save-menu',
    ACTION_BTN_CONNECTIONS: 'action-button-connections',
    ACTION_BTN_TABS: 'action-button-tabs',
    ENTRY_CONTEXT_MENU_KEY: 'entry-context-menu',
    REVISIONS_LIST: 'revisions-list',
    REVISIONS_LIST_ROW: 'revisions-list-row',
    REVISIONS_LIST_ROW_CURRENT: 'revisions-list__row_current',
    REVISIONS_LIST_ROW_DRAFT: 'revisions-list__row_draft',
    REVISIONS_LIST_ROW_ACTUAL: 'revisions-list__row_published',
    REVISIONS_LIST_LOADER: 'revisions-loader',
    REVISIONS_TOP_PANEL: 'revisions-top-panel',
};
