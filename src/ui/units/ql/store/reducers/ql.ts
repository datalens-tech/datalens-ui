import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {QLChartType, QLEntryDataShared} from 'shared';
import {DL, DatalensGlobalState} from 'ui';
import {
    selectVisualization as getWizardVisualization,
    selectColors,
    selectColorsConfig,
    selectLabels,
    selectShapes,
    selectShapesConfig,
    selectTooltips,
} from 'units/wizard/selectors/visualization';
import {selectExtraSettings as getExtraSettingsWizard} from 'units/wizard/selectors/widget';

import {AppStatus, DEFAULT_SALT, PANE_VIEWS, VisualizationStatus} from '../../constants';
import {
    ADD_PARAM,
    ADD_PARAM_IN_QUERY,
    ADD_QUERY,
    DRAW_PREVIEW,
    DUPLICATE_QUERY,
    REMOVE_PARAM,
    REMOVE_PARAM_IN_QUERY,
    REMOVE_QUERY,
    SET_CHART_TYPE,
    SET_COLUMNS_ORDER,
    SET_CONNECTION,
    SET_CONNECTION_SOURCES,
    SET_CONNECTION_SOURCE_SCHEMA,
    SET_DEFAULT_PATH,
    SET_ENTRY,
    SET_ERROR,
    SET_EXTRA_SETTINGS,
    SET_QUERY_METADATA,
    SET_QUERY_VALUE,
    SET_SETTINGS,
    SET_STATUS,
    SET_TABLE_PREVIEW_DATA,
    SET_VISUALIZATION_STATUS,
    TOGGLE_TABLE_PREVIEW,
    UPDATE_PARAM,
    UPDATE_PARAM_IN_QUERY,
    UPDATE_QUERY,
} from '../actions/ql';
import {
    QLAction,
    QLActionAddParamInQuery,
    QLActionDrawPreview,
    QLActionRemoveParam,
    QLActionRemoveParamInQuery,
    QLActionRemoveQuery,
    QLActionSetChartType,
    QLActionSetColumnsOrder,
    QLActionSetConnection,
    QLActionSetConnectionSourceSchema,
    QLActionSetConnectionSources,
    QLActionSetDefaultPath,
    QLActionSetEntry,
    QLActionSetError,
    QLActionSetExtraSettings,
    QLActionSetQueryMetadata,
    QLActionSetQueryValue,
    QLActionSetSettings,
    QLActionSetStatus,
    QLActionSetTablePreviewData,
    QLActionSetVisualizationStatus,
    QLActionUpdateParam,
    QLActionUpdateParamInQuery,
    QLActionUpdateQuery,
    QLGridScheme,
    QLGridSchemes,
    QLPaneView,
    QLPaneViewsById,
    QLState,
    QLTabData,
    QLTabsById,
} from '../typings/ql';
import {Helper} from '../utils/helper';

const initialState: QLState = {
    chartType: null,
    appStatus: AppStatus.Loading,
    defaultPath: DL.USER_LOGIN ? DL.USER_FOLDER : '/',
    visualizationStatus: VisualizationStatus.Empty,
    extraSettings: {},
    tablePreviewVisible: true,
    error: null,
    settings: {
        counter: 0,
        salt: DEFAULT_SALT,
    },
    entry: null,
    metadata: {
        order: [],
    },
    tablePreviewData: {},
    order: [],
    params: [],
    connection: null,
    connectionSources: [],
    connectionSourcesSchemas: {},
    chart: null,
    visualization: null,
    grid: {
        panes: [],
        scheme: '',
    },
    panes: {
        allIds: [],
        byId: {},
    },
    tabs: {
        byId: {},
        allIds: [],
    },
    queryValue: '',
    queries: [],
    paneViews: Helper.createPaneViewsData(),
};

/* --- SELECTORS --- */

export const getChartType = (state: DatalensGlobalState) => state.ql?.chartType;

export const getConnection = (state: DatalensGlobalState) => state.ql.connection;

export const getConnectionSources = (state: DatalensGlobalState) => state.ql.connectionSources;

export const getConnectionSourcesSchemas = (state: DatalensGlobalState) =>
    state.ql.connectionSourcesSchemas;

export const getAppStatus = (state: DatalensGlobalState) => state.ql.appStatus;

export const getAppError = (state: DatalensGlobalState) => state.ql.error;

export const getVisualizationStatus = (state: DatalensGlobalState) => state.ql.visualizationStatus;

export const getExtraSettings = getExtraSettingsWizard;

export const getTablePreviewVisible = (state: DatalensGlobalState) => state.ql.tablePreviewVisible;

export const getQueryValue = (state: DatalensGlobalState) => state.ql.queryValue;

export const getQueries = (state: DatalensGlobalState) => state.ql.queries;

export const getRedirectUrl = (state: DatalensGlobalState) => state.ql.redirectUrl;

export const getCurrentSchemeId = (state: DatalensGlobalState) => state.ql.grid.scheme;

export const getGridSchemes = createSelector(
    [getVisualizationStatus, getTablePreviewVisible],
    (visualizationStatus, tablePreviewVisible): QLGridSchemes => {
        const visualizationAndChartPreviewPane: QLGridScheme = {
            name: 'pane',
            props: {
                split: 'vertical',
                defaultSize: 240,
                minSize: 200,
                maxSize: -200,
            },
            childNodes: [
                {
                    name: 'child',
                    index: 1,
                },
                {
                    name: 'child',
                    index: 2,
                    props: {
                        loader: visualizationStatus === VisualizationStatus.LoadingChart,
                    },
                },
            ],
        };

        const tablePreviewPane: QLGridScheme = {
            name: 'child',
            index: 3,
        };

        return {
            ids: ['1-3'],
            default: '1-3',
            schemes: {
                '1-3': {
                    panes: [
                        PANE_VIEWS.MAIN,
                        PANE_VIEWS.SETTINGS,
                        PANE_VIEWS.PREVIEW,
                        PANE_VIEWS.TABLE_PREVIEW,
                    ],
                    scheme: [
                        {
                            name: 'pane',
                            props: {
                                split: 'vertical',
                                minSize: 452,
                                maxSize: -500,
                                defaultSize: '40%',
                            },
                            childNodes: [
                                {
                                    name: 'child',
                                    index: 0,
                                },
                                {
                                    name: 'pane',
                                    props: {
                                        split: 'horizontal',
                                        defaultSize: '75%',
                                        minSize: 150,
                                        maxSize: -150,
                                        pane1Style: tablePreviewVisible
                                            ? undefined
                                            : {
                                                  height: '100%',
                                              },
                                        resizerStyle: tablePreviewVisible
                                            ? undefined
                                            : {
                                                  display: 'none',
                                              },
                                        pane2Style: tablePreviewVisible
                                            ? undefined
                                            : {
                                                  display: 'none',
                                              },
                                        loader:
                                            visualizationStatus ===
                                            VisualizationStatus.LoadingEverything,
                                    },
                                    childNodes: [
                                        visualizationAndChartPreviewPane,
                                        tablePreviewPane,
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        };
    },
);

export const getGridPanesIds = (state: DatalensGlobalState) => state.ql.grid?.panes;

export const getEntry = (state: DatalensGlobalState) => state.ql.entry;

export const getQueryMetadata = (state: DatalensGlobalState) => state.ql.metadata;

export const getTablePreviewData = (state: DatalensGlobalState) => state.ql.tablePreviewData;

export const getOrder = (state: DatalensGlobalState) => state.ql.order;

export const getChart = (state: DatalensGlobalState) => state.ql.chart;

export const getDefaultPath = (state: DatalensGlobalState) => state.ql.defaultPath;

export const getParams = (state: DatalensGlobalState) => state.ql.params;

export const getValid = createSelector(
    [getEntry, getConnection, getParams],
    (entry, connection, params): boolean => {
        if (!entry) {
            return false;
        }

        if (!connection) {
            return false;
        }

        return params.every((param) => {
            return param.type && param.name;
        });
    },
);

export const getVisualization = getWizardVisualization;

export const getVisualizationIsEmpty = createSelector(
    [getVisualization],
    (visualization): boolean => {
        return visualization?.placeholders.every((placeholder) => {
            return placeholder.items.length === 0;
        });
    },
);

export const getEntryIsLocked = createSelector([getEntry], (entry): boolean => {
    return Boolean(entry && entry.permissions && entry.permissions.edit === false);
});

const getPlaceholdersContent = createSelector(
    selectColors,
    selectColorsConfig,
    selectLabels,
    selectTooltips,
    selectShapes,
    selectShapesConfig,
    (colors, colorsConfig, labels, tooltips, shapes, shapesConfig) => {
        return {
            colors,
            colorsConfig,
            labels,
            tooltips,
            shapes,
            shapesConfig,
        };
    },
);

export const getEntryNotChanged = createSelector(
    getEntry,
    getExtraSettings,
    getQueryValue,
    getQueries,
    getConnection,
    getVisualization,
    getParams,
    getChartType,
    getPlaceholdersContent,
    (
        entry,
        extraSettings,
        queryValue,
        queries,
        connection,
        visualization,
        params,
        chartType,
        placeholdersContent,
    ): boolean => {
        if (chartType && entry && entry.data && connection && visualization) {
            const actualSharedData: QLEntryDataShared = {
                type: 'ql',
                connection: {
                    entryId: connection.entryId,
                    type: connection.type,
                },
                colors: placeholdersContent.colors || [],
                colorsConfig: placeholdersContent.colorsConfig || {},
                labels: placeholdersContent.labels || [],
                tooltips: placeholdersContent.tooltips || [],
                shapes: placeholdersContent.shapes || [],
                shapesConfig: placeholdersContent.shapesConfig || [],
                extraSettings: extraSettings || {},
                params: params.map((param) => {
                    return {
                        type: param.type,
                        name: param.name,
                        defaultValue: param.defaultValue,
                    };
                }),
                queryValue,
                queries,
                chartType,
                visualization,
                order: [],
            };

            // Removing possible functions from the structure to compare data
            const actualSharedDataWOFunctions = JSON.parse(JSON.stringify(actualSharedData));

            return _.isEqual(entry.data.shared, actualSharedDataWOFunctions);
        } else {
            return true;
        }
    },
);

export const getEntryCanBeSaved = createSelector(
    [getValid, getVisualizationIsEmpty, getEntryIsLocked, getEntryNotChanged],
    (valid, visualizationIsEmpty, entryIsLocked, entryNotChanged): boolean => {
        return valid && !visualizationIsEmpty && !entryIsLocked && !entryNotChanged;
    },
);

export const getPreviewData = createSelector(
    getChartType,
    getQueryValue,
    getQueries,
    getExtraSettings,
    getConnection,
    getVisualization,
    getParams,
    getPlaceholdersContent,
    getOrder,
    (
        chartType,
        queryValue,
        queries,
        extraSettings,
        connection,
        visualization,
        params,
        placeholdersContent,
        order,
    ): any | null => {
        if (chartType && connection && visualization) {
            const result = {
                type: 'ql',
                chartType,
                connection: {
                    entryId: connection.entryId,
                    type: connection.type,
                },
                colors: placeholdersContent.colors || [],
                colorsConfig: placeholdersContent.colorsConfig || {},
                labels: placeholdersContent.labels || [],
                tooltips: placeholdersContent.tooltips || [],
                shapes: placeholdersContent.shapes || [],
                shapesConfig: placeholdersContent.shapesConfig || [],
                extraSettings,
                queryValue,
                queries,
                params: params,
                visualization,
                order,
            };

            return result;
        } else {
            return null;
        }
    },
);

const getPaneCurrentTabId = (state: DatalensGlobalState, props: {paneId: string}) => {
    return state.ql.panes.byId[props.paneId].currentTab;
};

const getTabsAllIds = (state: DatalensGlobalState) => state.ql.tabs.allIds;

const getTabsById = (state: DatalensGlobalState) => state.ql.tabs.byId;

export const getTabsData = createSelector<DatalensGlobalState, string[], QLTabsById, QLTabData[]>(
    getTabsAllIds,
    getTabsById,
    (tabsIds, tabsById) => {
        return tabsIds.map((id: string) => tabsById[id]);
    },
);

export const makeGetPaneTabs = (state: DatalensGlobalState, props: {paneId: string}) =>
    createSelector<DatalensGlobalState, string[], QLTabsById, string | null, QLTabData[]>(
        getTabsAllIds,
        getTabsById,
        (_state) => getPaneCurrentTabId(_state, props),
        (tabsIds, tabsById, currentTabId) => {
            return currentTabId === null ? [] : tabsIds.map((id: string) => tabsById[id]);
        },
    )(state);

export const makeGetPaneTabData = (state: DatalensGlobalState, props: {paneId: string}) =>
    createSelector<DatalensGlobalState, QLTabsById, string | null, QLTabData | null>(
        getTabsById,
        (_state) => getPaneCurrentTabId(_state, props),
        (tabsById, currentTabId) => {
            return currentTabId === null ? null : tabsById[currentTabId];
        },
    )(state);

const getPaneViewsById = (state: DatalensGlobalState) => state.ql.paneViews.byId;

const getPaneCurrentViewId = (state: DatalensGlobalState, props: {paneId: string}) => {
    return state.ql.panes?.byId[props.paneId].view;
};

export const makeGetPaneView = (state: DatalensGlobalState, props: {paneId: string}) =>
    createSelector<DatalensGlobalState, QLPaneViewsById, string, QLPaneView>(
        getPaneViewsById,
        (_state) => getPaneCurrentViewId(_state, props),
        (paneViewsById: QLPaneViewsById, currentViewId: string) => {
            return paneViewsById[currentViewId];
        },
    )(state);

export const selectInitalQlChartConfig = (state: DatalensGlobalState) =>
    state.ql.entry?.data.shared;

// eslint-disable-next-line complexity
export default function ql(state: QLState = initialState, action: QLAction) {
    switch (action.type) {
        case SET_STATUS: {
            const {appStatus} = action as QLActionSetStatus;
            return {
                ...state,
                appStatus,
            };
        }

        case SET_ERROR: {
            const {error} = action as QLActionSetError;

            return {
                ...state,
                error,
            };
        }

        case SET_SETTINGS: {
            const {
                chartType,
                tabs,
                queryValue,
                queries,
                settings,
                panes,
                grid,
                chart,
                params,
                redirectUrl,
            } = action as QLActionSetSettings;

            return {
                ...state,
                chartType,
                tabs,
                queryValue,
                queries,
                settings,
                panes,
                grid,
                chart,
                params,
                redirectUrl,
            };
        }

        case SET_DEFAULT_PATH: {
            const {newDefaultPath} = action as QLActionSetDefaultPath;

            return {
                ...state,
                defaultPath: newDefaultPath,
            };
        }

        case SET_ENTRY: {
            const {entry} = action as QLActionSetEntry;

            return {
                ...state,
                entry,
            };
        }

        case SET_EXTRA_SETTINGS: {
            const {extraSettings} = action as QLActionSetExtraSettings;

            return {
                ...state,
                extraSettings,
            };
        }

        case ADD_QUERY: {
            let {queries} = state;

            queries = [
                ...queries,
                {
                    value: '',
                    params: [],
                },
            ];

            return {
                ...state,
                queries,
            };
        }

        case UPDATE_QUERY: {
            const {query, index} = action as unknown as QLActionUpdateQuery;

            const queries = [...state.queries];

            queries.splice(index, 1, query);

            return {
                ...state,
                queries,
            };
        }

        case DUPLICATE_QUERY: {
            const {index} = action as unknown as QLActionUpdateQuery;

            const queries = [...state.queries];
            const query = queries[index];

            queries.splice(index, 0, query);

            return {
                ...state,
                queries,
            };
        }

        case REMOVE_QUERY: {
            const {index} = action as unknown as QLActionRemoveQuery;

            const queries = [...state.queries];

            queries.splice(index, 1);

            return {
                ...state,
                queries,
            };
        }

        case ADD_PARAM: {
            let {params} = state;

            params = [
                ...params,
                {
                    name: '',
                    type: 'string',
                    defaultValue: '',
                },
            ];

            return {
                ...state,
                params,
            };
        }

        case UPDATE_PARAM: {
            const {param, index} = action as unknown as QLActionUpdateParam;

            const params = [...state.params];

            params.splice(index, 1, param);

            return {
                ...state,
                params,
            };
        }

        case REMOVE_PARAM: {
            const {index} = action as unknown as QLActionRemoveParam;
            const params = [...state.params];
            params.splice(index, 1);
            return {
                ...state,
                params,
            };
        }

        case ADD_PARAM_IN_QUERY: {
            const {queryIndex} = action as unknown as QLActionAddParamInQuery;

            const {queries} = state;

            const query = queries[queryIndex];

            const params = [
                ...(query.params || []),
                {
                    name: '',
                    type: 'string',
                    defaultValue: '',
                },
            ];

            const newQuery = {
                ...query,
                params,
            };

            const newQueries = [...queries];

            newQueries.splice(queryIndex, 1, newQuery);

            return {
                ...state,
                queries: newQueries,
            };
        }

        case UPDATE_PARAM_IN_QUERY: {
            const {queryIndex, paramIndex, param} = action as unknown as QLActionUpdateParamInQuery;

            const {queries} = state;

            const query = queries[queryIndex];

            const {params} = query;

            params.splice(paramIndex, 1, param);

            const newQuery = {
                ...query,
                params,
            };

            const newQueries = [...queries];

            newQueries.splice(queryIndex, 1, newQuery);

            return {
                ...state,
                queries: newQueries,
            };
        }

        case REMOVE_PARAM_IN_QUERY: {
            const {queryIndex, paramIndex} = action as unknown as QLActionRemoveParamInQuery;

            const {queries} = state;

            const query = queries[queryIndex];

            const {params} = query;

            params.splice(paramIndex, 1);

            const newQuery = {
                ...query,
                params,
            };

            const newQueries = [...queries];

            newQueries.splice(queryIndex, 1, newQuery);

            return {
                ...state,
                queries: newQueries,
            };
        }

        case SET_QUERY_METADATA: {
            const {metadata} = action as QLActionSetQueryMetadata;

            return {
                ...state,
                metadata,
            };
        }

        case SET_TABLE_PREVIEW_DATA: {
            const {tablePreviewData} = action as unknown as QLActionSetTablePreviewData;

            return {
                ...state,
                tablePreviewData,
            };
        }

        case SET_VISUALIZATION_STATUS: {
            const {visualizationStatus} = action as unknown as QLActionSetVisualizationStatus;

            return {
                ...state,
                visualizationStatus,
            };
        }

        case TOGGLE_TABLE_PREVIEW: {
            return {
                ...state,
                tablePreviewVisible: !state.tablePreviewVisible,
            };
        }

        case SET_COLUMNS_ORDER: {
            const {order} = action as QLActionSetColumnsOrder;

            return {
                ...state,
                order,
            };
        }

        case SET_CONNECTION_SOURCES: {
            const {connectionSources, connectionFreeformSources} =
                action as QLActionSetConnectionSources;

            return {
                ...state,
                connectionSources,
                connectionFreeformSources,
            };
        }

        case SET_CONNECTION_SOURCE_SCHEMA: {
            const {schema, tableName} = action as QLActionSetConnectionSourceSchema;

            const {connectionSourcesSchemas} = state;

            return {
                ...state,
                connectionSourcesSchemas: {
                    ...connectionSourcesSchemas,
                    [tableName]: schema,
                },
            };
        }

        case SET_CHART_TYPE: {
            const {chartType} = action as QLActionSetChartType;

            let params = state.params;

            const defaultFrom = moment().subtract(3, 'h').toISOString();
            const defaultTo = moment().toISOString();

            // The chart type is entered once, during initialization
            // Therefore, if necessary, we will immediately set the default parameters for each type of chart
            if (chartType === QLChartType.Promql && params.length === 0) {
                params = [
                    {
                        type: 'datetime',
                        name: 'from',
                        defaultValue: defaultFrom,
                    },
                    {type: 'datetime', name: 'to', defaultValue: defaultTo},
                    {type: 'string', name: 'step', defaultValue: '300'},
                ];
            }

            // The chart type is entered once, during initialization
            // Therefore, if necessary, we will immediately set the default parameters for each type of chart
            if (chartType === QLChartType.Monitoringql && params.length === 0) {
                params = [
                    {
                        type: 'datetime',
                        name: 'from',
                        defaultValue: defaultFrom,
                    },
                    {type: 'datetime', name: 'to', defaultValue: defaultTo},
                ];
            }

            return {
                ...state,
                chartType,
                params,
            };
        }

        case SET_CONNECTION: {
            const {connection} = action as QLActionSetConnection;
            return {
                ...state,
                connection,
            };
        }

        case SET_QUERY_VALUE: {
            const {newValue} = action as QLActionSetQueryValue;
            return {
                ...state,
                queryValue: newValue,
            };
        }

        case DRAW_PREVIEW: {
            const {entry} = state;

            if (!entry) {
                return state;
            }

            const {withoutTable = false, previewData} = action as QLActionDrawPreview;

            const updateKey = state.chart ? state.chart.updateKey + 1 : 0;

            let visualizationStatus;

            const previewDataCopy = _.cloneDeep(previewData);

            if (withoutTable) {
                visualizationStatus = VisualizationStatus.LoadingChart;
            } else {
                if (previewDataCopy !== null) {
                    previewDataCopy.preview = true;
                }

                visualizationStatus = VisualizationStatus.LoadingEverything;
            }

            return {
                ...state,
                visualizationStatus,
                chart: {
                    withoutTable,
                    preview: {
                        type: entry.type,
                        data: {
                            shared: previewDataCopy,
                        },
                        key: entry.fake ? undefined : entry.key,
                        updateKey,
                    },
                    updateKey,
                },
            };
        }
    }

    return state;
}
