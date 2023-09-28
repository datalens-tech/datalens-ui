import {AxiosError} from 'axios';
import {History, Location} from 'history';
import {i18n} from 'i18n';
import _ from 'lodash';
import moment from 'moment';
import type {match as Match} from 'react-router-dom';
import {
    CommonSharedExtraSettings,
    ConnectorType,
    Dataset,
    ENTRY_TYPES,
    EntryUpdateMode,
    Feature,
    QLChartType,
    QLEntryDataShared,
    QLParam,
    QLPreviewTableData,
    QLQuery,
    QLResultEntryMetadataDataColumnOrGroup,
    Shared,
    extractEntryId,
    resolveIntervalDate,
    resolveOperation,
} from 'shared';
import {AppDispatch} from 'store';
import {saveWidget, setActualChart} from 'store/actions/chartWidget';
import {DL, DatalensGlobalState, Entry, URL_QUERY, Utils} from 'ui';
import {navigateHelper} from 'ui/libs';
import {prepareChartDataBeforeSave} from 'units/ql/modules/helpers';
import {
    getEntry,
    getGridSchemes,
    getPreviewData,
    selectInitalQlChartConfig,
} from 'units/ql/store/reducers/ql';
import {
    resetWizardStore,
    setVisualizationPlaceholderItems,
    setVisualization as setVisualizationWizard,
} from 'units/wizard/actions';
import {setDataset} from 'units/wizard/actions/dataset';
import {
    setAvailable,
    setColors,
    setColorsConfig,
    setDistincts,
    setLabels,
    setShapes,
    setShapesConfig,
    updatePlaceholderSettings,
} from 'units/wizard/actions/visualization';
import {setExtraSettings as setWizardExtraSettings} from 'units/wizard/actions/widget';

import type {GetEntryArgs} from '../../../../../shared/schema';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {registry} from '../../../../registry';
import {UrlSearch, getUrlParamFromStr} from '../../../../utils';
import {
    load as loadParentDashConfig,
    setEditMode as setEditModeForParentDash,
} from '../../../dash/store/actions/dash';
import {
    AVAILABLE_CHART_TYPES,
    AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE,
    AppStatus,
    QL_MOCKED_DATASET_ID,
    VisualizationStatus,
} from '../../constants';
import {getAvailableQlVisualizations, getDefaultQlVisualization} from '../../utils/visualization';
import {
    QLAction,
    QLChart,
    QLConnectionEntry,
    QLEntry,
    QLGrid,
    QLPanes,
    QLSettings,
    QLTabs,
} from '../typings/ql';
import {Helper} from '../utils/helper';

export const SET_CHART_TYPE = Symbol('ql/SET_CHART_TYPE');
export const SET_STATUS = Symbol('ql/SET_STATUS');
export const SET_ERROR = Symbol('ql/SET_ERROR');
export const SET_SETTINGS = Symbol('ql/SET_SETTINGS');
export const SET_DEFAULT_PATH = Symbol('ql/SET_DEFAULT_PATH');
export const SET_ENTRY = Symbol('ql/SET_ENTRY');
export const SET_EXTRA_SETTINGS = Symbol('ql/SET_EXTRA_SETTINGS');
export const SET_QUERY_METADATA = Symbol('ql/SET_QUERY_METADATA');
export const SET_TABLE_PREVIEW_DATA = Symbol('ql/SET_TABLE_PREVIEW_DATA');
export const SET_VISUALIZATION_STATUS = Symbol('ql/SET_VISUALIZATION_STATUS');
export const SET_COLUMNS_ORDER = Symbol('ql/SET_COLUMNS_ORDER');
export const SET_CONNECTION_SOURCES = Symbol('ql/SET_CONNECTION_SOURCES');
export const SET_CONNECTION_SOURCE_SCHEMA = Symbol('ql/SET_CONNECTION_SOURCE_SCHEMA');
export const SET_CONNECTION = Symbol('ql/SET_CONNECTION');
export const SET_QUERY_VALUE = Symbol('ql/SET_QUERY_VALUE');

export const ADD_QUERY = Symbol('ql/ADD_QUERY');
export const UPDATE_QUERY = Symbol('ql/UPDATE_QUERY');
export const DUPLICATE_QUERY = Symbol('ql/DUPLICATE_QUERY');
export const REMOVE_QUERY = Symbol('ql/REMOVE_QUERY');

export const ADD_PARAM = Symbol('ql/ADD_PARAM');
export const UPDATE_PARAM = Symbol('ql/UPDATE_PARAM');
export const REMOVE_PARAM = Symbol('ql/REMOVE_PARAM');

export const ADD_PARAM_IN_QUERY = Symbol('ql/ADD_PARAM_IN_QUERY');
export const UPDATE_PARAM_IN_QUERY = Symbol('ql/UPDATE_PARAM_IN_QUERY');
export const REMOVE_PARAM_IN_QUERY = Symbol('ql/REMOVE_PARAM_IN_QUERY');

export const TOGGLE_TABLE_PREVIEW = Symbol('ql/TOGGLE_TABLE_PREVIEW');
export const DRAW_PREVIEW = Symbol('ql/DRAW_PREVIEW');
export const RESET_QL_STORE = Symbol('ql/RESET_QL_STORE');

// Action functions and interfaces

export const resetQLStore = () => {
    return {
        type: RESET_QL_STORE,
    };
};

export const setStatus = (appStatus: AppStatus) => {
    return {
        type: SET_STATUS,
        appStatus,
    };
};

interface SetErrorProps {
    error: Error;
}

export const setError = ({error}: SetErrorProps) => {
    return {
        type: SET_ERROR,
        error,
    };
};

interface SetSettingsProps {
    chartType: QLChartType | null;
    tabs: QLTabs;
    queryValue: string;
    queries: QLQuery[];
    settings: QLSettings;
    panes: QLPanes;
    grid: QLGrid;
    chart: QLChart | null;
    params: QLParam[];
    redirectUrl?: string;
}

export const setSettings = ({
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
}: SetSettingsProps) => {
    return {
        type: SET_SETTINGS,
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
};

interface SetEntryProps {
    entry: QLEntry | null;
}

export const setDefaultPath = (newDefaultPath: string) => {
    return {
        newDefaultPath,
        type: SET_DEFAULT_PATH,
    };
};

export const setEntry = ({entry}: SetEntryProps) => {
    return {
        type: SET_ENTRY,
        entry,
    };
};

export const setExtraSettings = ({extraSettings}: {extraSettings: CommonSharedExtraSettings}) => {
    return {
        type: SET_EXTRA_SETTINGS,
        extraSettings,
    };
};

export const addParam = () => {
    return {
        type: ADD_PARAM,
    };
};

export const updateParam = ({param, index}: {param: QLParam; index: number}) => {
    return {
        type: UPDATE_PARAM,
        param,
        index,
    };
};

export const removeParam = ({index}: {index: number}) => {
    return {
        type: REMOVE_PARAM,
        index,
    };
};

export const addParamInQuery = ({queryIndex}: {queryIndex: number}) => {
    return {
        type: ADD_PARAM_IN_QUERY,
        queryIndex,
    };
};

export const updateParamInQuery = ({
    param,
    queryIndex,
    paramIndex,
}: {
    param: QLParam;
    queryIndex: number;
    paramIndex: number;
}) => {
    return {
        type: UPDATE_PARAM_IN_QUERY,
        param,
        queryIndex,
        paramIndex,
    };
};

export const removeParamInQuery = ({
    queryIndex,
    paramIndex,
}: {
    queryIndex: number;
    paramIndex: number;
}) => {
    return {
        type: REMOVE_PARAM_IN_QUERY,
        queryIndex,
        paramIndex,
    };
};

export const addQuery = () => {
    return {
        type: ADD_QUERY,
    };
};

export const updateQuery = ({query, index}: {query: QLQuery; index: number}) => {
    return {
        type: UPDATE_QUERY,
        query,
        index,
    };
};

export const duplicateQuery = ({index}: {index: number}) => {
    return {
        type: DUPLICATE_QUERY,
        index,
    };
};

export const removeQuery = ({index}: {index: number}) => {
    return {
        type: REMOVE_QUERY,
        index,
    };
};

export interface SetQueryMetadataProps {
    metadata: {
        order: QLResultEntryMetadataDataColumnOrGroup;
        visualization?: any;
        available?: any[];
        colors?: any[];
        distincts?: Record<string, string[]>;
    };
}

export const setQueryMetadata = ({metadata}: SetQueryMetadataProps) => {
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        const {
            wizard: {
                visualization: {visualization},
            },
        } = getState();

        if (visualization && metadata.visualization) {
            metadata.visualization.placeholders.forEach((placeholder: any, index: number) => {
                dispatch(
                    setVisualizationPlaceholderItems({
                        visualization,
                        placeholder: visualization.placeholders[index],
                        items: placeholder.items,
                        onDone: () => {},
                    }),
                );
            });

            if (metadata.colors) {
                dispatch(setColors({colors: metadata.colors}));
            }

            if (metadata.available) {
                dispatch(setAvailable({available: metadata.available}));
            }

            if (metadata.distincts) {
                dispatch(setDistincts({distincts: metadata.distincts}));
            }

            dispatch(
                setColumnsOrder({
                    order: [],
                }),
            );
        }
    };
};

interface SetTablePreviewDataProps {
    tablePreviewData: QLPreviewTableData;
}

export const setTablePreviewData = ({tablePreviewData}: SetTablePreviewDataProps) => {
    return {
        type: SET_TABLE_PREVIEW_DATA,
        tablePreviewData,
    };
};

export const setVisualizationStatus = (visualizationStatus: VisualizationStatus) => {
    return {
        type: SET_VISUALIZATION_STATUS,
        visualizationStatus,
    };
};

export const toggleTablePreview = () => {
    return {
        type: TOGGLE_TABLE_PREVIEW,
    };
};

interface SetColumnsOrderProps {
    order: QLResultEntryMetadataDataColumnOrGroup[];
}

export const setColumnsOrder = ({order}: SetColumnsOrderProps) => {
    return {
        type: SET_COLUMNS_ORDER,
        order,
    };
};

export const setConnectionSources = ({
    connectionSources,
    connectionFreeformSources,
}: {
    connectionSources: Record<string, string>[];
    connectionFreeformSources: Record<string, string>[];
}) => {
    return {
        type: SET_CONNECTION_SOURCES,
        connectionSources,
        connectionFreeformSources,
    };
};

export const setConnectionSourceSchema = ({
    tableName,
    schema,
}: {
    tableName: string;
    schema: Record<string, any>[];
}) => {
    return {
        type: SET_CONNECTION_SOURCE_SCHEMA,
        tableName,
        schema,
    };
};

export const setQueryValue = (newValue: string) => {
    return {
        newValue,
        type: SET_QUERY_VALUE,
    };
};

export const setConnection = (connection: QLConnectionEntry) => {
    return {
        connection,
        type: SET_CONNECTION,
    };
};

export const setChartType = (chartType: QLChartType | null) => {
    return {
        chartType,
        type: SET_CHART_TYPE,
    };
};

export const drawPreview = ({withoutTable}: {withoutTable?: boolean} = {}) => {
    return (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) => {
        const previewData = getPreviewData(getState());

        dispatch({
            type: DRAW_PREVIEW,
            withoutTable: withoutTable || false,
            previewData,
        });
    };
};

const applyUrlParams = (params: QLParam[]) => {
    // If there are no parameters, then exit immediately
    if (params.length === 0) {
        return;
    }

    // Splitting search into pairs
    const searchPairs = new URLSearchParams(window.location.search);

    if (searchPairs) {
        // If there are filters that come through search parameters
        searchPairs.forEach((value, key) => {
            const targetParam = params.find((param) => {
                return param.name === key;
            });

            // If there is no such parameter, then skip
            if (!targetParam) {
                return;
            }

            const resolvedValueAndOperation = resolveOperation(value);

            if (resolvedValueAndOperation) {
                if (targetParam.type.includes('interval') && value.includes('__interval')) {
                    const resolvedInterval = resolveIntervalDate(resolvedValueAndOperation.value);

                    if (resolvedInterval) {
                        targetParam.overridenValue = resolvedInterval;

                        console.warn(targetParam.overridenValue);
                    }
                } else if (typeof targetParam.overridenValue === 'undefined') {
                    // Case when the parameter was first encountered in the url
                    // Writing an overridenValue
                    targetParam.overridenValue = resolvedValueAndOperation.value;
                } else if (Array.isArray(targetParam.overridenValue)) {
                    // Case when the parameter in the url was encountered for more than the second time
                    // overridenValue is already an array, push value into it
                    targetParam.overridenValue.push(resolvedValueAndOperation.value);
                } else if (typeof targetParam.overridenValue === 'string') {
                    // Case when the parameter was encountered in the url for the second time
                    // overridenValue is made an array of the old value and the new one
                    targetParam.overridenValue = [
                        targetParam.overridenValue,
                        resolvedValueAndOperation.value,
                    ];
                }
            } else {
                console.warn('Failed to resolve value and operation of parameter', value);
            }
        });
    }
};

type InitializeApplicationArgs = {
    history: History<unknown>;
    location: Location<unknown>;
    match: Match<{
        qlEntryId?: string;
        workbookId?: string;
    }>;
};

export const loadParentDash = (history: History) => {
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        const state = getState();

        if (!state.dash?.data?.tabs) {
            // @ts-ignore
            await dispatch(loadParentDashConfig({location: history.location, history}));
            await dispatch(setEditModeForParentDash());
        }
    };
};

type FetchConnectionSourcesArgs = {
    entryId: string;
};

export const fetchConnectionSources = ({entryId}: FetchConnectionSourcesArgs) => {
    // eslint-disable-next-line consistent-return
    return async function (dispatch: AppDispatch<QLAction>) {
        try {
            // Requesting information about connection sources
            const {sources: connectionSources, freeform_sources: connectionFreeformSources} =
                await getSdk().bi.getConnectionSources({
                    connectionId: entryId,
                });

            if (!connectionSources) {
                throw new Error(i18n('sql', 'error_failed-to-load-connection'));
            }

            dispatch(
                setConnectionSources({
                    connectionSources,
                    connectionFreeformSources,
                }),
            );
        } catch (error) {
            logger.logError('ql: getConnectionSources failed', error);
        }
    };
};

type FetchConnectionSourceSchemaArgs = {
    tableName: string;
};

export const fetchConnectionSourceSchema = ({tableName}: FetchConnectionSourceSchemaArgs) => {
    // eslint-disable-next-line consistent-return
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        const splittedTableName = tableName.split('.');

        const splittedTableNameLength = splittedTableName.length;
        const title = splittedTableName[splittedTableNameLength - 1];
        const group =
            splittedTableNameLength > 1
                ? splittedTableName.slice(0, splittedTableNameLength - 1)
                : null;

        const {
            ql: {connection, connectionSources},
        } = getState();

        try {
            const targetConnectionSource = connectionSources.find((connectionSource) => {
                const sameTitle = connectionSource.title.toLowerCase() === title;

                if (!sameTitle) {
                    return false;
                }

                if (!group) {
                    return sameTitle;
                }

                const sameGroup = connectionSource.group.join().toLowerCase() === group?.join();

                return sameGroup;
            });

            if (!targetConnectionSource) {
                throw new Error(`Unknown connection source: ${tableName}`);
            }

            const {raw_schema: schema} = await getSdk().bi.getConnectionSourceSchema({
                connectionId: connection!.entryId,
                source: {...targetConnectionSource, id: 'sample'},
            });

            dispatch(setConnectionSourceSchema({tableName, schema}));

            return schema;
        } catch (error) {
            logger.logError('ql: getConnectionSourceSchema failed', error);

            return null;
        }
    };
};

export const initializeApplication = (args: InitializeApplicationArgs) => {
    // eslint-disable-next-line consistent-return, complexity
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        dispatch(setStatus(AppStatus.Loading));

        dispatch(resetWizardStore());
        dispatch(resetQLStore());

        const {location, history, match} = args;
        const urlWorkbookId = match.params.workbookId;

        let entry: QLEntry;

        const urlSearch = new UrlSearch(window.location.search);

        const searchCurrentPath = urlSearch.get(URL_QUERY.CURRENT_PATH);
        if (searchCurrentPath) {
            dispatch(setDefaultPath(decodeURIComponent(searchCurrentPath)));
        }

        dispatch(
            setDataset({
                dataset: {
                    id: QL_MOCKED_DATASET_ID,
                } as Dataset,
            }),
        );

        const urlEntryId = extractEntryId(location.pathname || '');

        if (urlEntryId) {
            try {
                const getEntryArgs: GetEntryArgs = {
                    entryId: urlEntryId,
                    includePermissionsInfo: true,
                    includeLinks: true,
                    revId: getUrlParamFromStr(location.search, URL_QUERY.REV_ID) || undefined,
                    branch: 'published',
                };

                const loadedEntry = await getSdk().us.getEntry(getEntryArgs);

                if (!loadedEntry) {
                    throw new Error(i18n('sql', 'error_failed-to-load-chart'));
                }

                if (!ENTRY_TYPES.ql.includes(loadedEntry.type)) {
                    const {pathname} = new URL(navigateHelper.redirectUrlSwitcher(loadedEntry));
                    history.replace({...history.location, pathname});

                    return;
                }

                entry = loadedEntry as QLEntry;

                if (typeof loadedEntry.data?.shared === 'string') {
                    entry.data.shared = JSON.parse(loadedEntry.data.shared);
                } else {
                    throw new Error(i18n('sql', 'error_failed-to-parse-loaded-chart'));
                }

                if (!entry) {
                    throw new Error(i18n('sql', 'error_failed-to-load-chart'));
                }

                dispatch(
                    setEntry({
                        entry,
                    }),
                );

                const {
                    connection: {entryId: connectionEntryId},
                } = entry.data.shared;

                // We request the connection for which the chart is built
                const loadedConnectionEntry = await getSdk().us.getEntry({
                    entryId: connectionEntryId,
                });

                if (!loadedConnectionEntry) {
                    throw new Error(i18n('sql', 'error_failed-to-load-connection'));
                }

                const connection: QLConnectionEntry = loadedConnectionEntry as QLConnectionEntry;
                const keyParts = connection.key.split('/');
                connection.name = keyParts[keyParts.length - 1];

                dispatch(setConnection(connection));

                if (
                    ![
                        ConnectorType.Monitoring,
                        ConnectorType.MonitoringExt,
                        ConnectorType.Promql,
                    ].includes(connection.type as ConnectorType)
                ) {
                    dispatch(fetchConnectionSources({entryId: loadedConnectionEntry.entryId}));
                }

                const {
                    queryValue,
                    queries = [],
                    extraSettings,
                    colors,
                    colorsConfig,
                    labels,
                    shapes,
                    shapesConfig,
                    order,
                } = entry.data.shared;

                const loadedVisualization = entry.data.shared
                    .visualization as Shared['visualization'];

                const {id: loadedVisualizationId, placeholders: loadedVisualizationPlaceholders} =
                    loadedVisualization;

                // Clone the parameters so as not to transform them into entry
                const params = entry.data.shared.params
                    ? _.cloneDeep(entry.data.shared.params)
                    : [];

                let datalensGlobalState = getState();

                const {
                    ql: {settings},
                } = datalensGlobalState;

                const {tabs} = Helper.createTabData();

                const {
                    settings: newSettings,
                    panes,
                    grid,
                } = Helper.createGridData({
                    tabs,
                    entry,
                    settings,
                    gridSchemes: getGridSchemes(datalensGlobalState),
                });

                applyUrlParams(params);

                // By default ChartType === 'sql', since there were only sql charts before
                const chartType = entry?.data.shared.chartType || 'sql';

                dispatch(
                    setSettings({
                        tabs,
                        chartType,
                        queryValue,
                        queries,
                        settings: newSettings,
                        panes,
                        grid,
                        chart: null,
                        params,
                    }),
                );

                dispatch(setWizardExtraSettings(extraSettings));

                const fixedVisualizationId =
                    loadedVisualizationId === 'table' ? 'flatTable' : loadedVisualizationId;

                const availableVisualizations = getAvailableQlVisualizations();
                const visualization = (availableVisualizations.find((someVisualization) => {
                    return someVisualization.id === fixedVisualizationId;
                }) || getDefaultQlVisualization()) as Shared['visualization'];

                dispatch(
                    setVisualizationWizard({
                        visualization: visualization,
                    }),
                );

                // We will put down the legacy-order, if there is one
                // When you save the chart, it will be deleted and you can forget about it
                if (order && order.length > 0) {
                    dispatch(
                        setColumnsOrder({
                            order: order || [],
                        }),
                    );
                }

                loadedVisualizationPlaceholders?.forEach((placeholder: any, index: number) => {
                    dispatch(
                        setVisualizationPlaceholderItems({
                            visualization,
                            placeholder: visualization.placeholders[index],
                            items: placeholder.items,
                            onDone: () => {},
                        }),
                    );

                    dispatch(updatePlaceholderSettings(placeholder.id, placeholder.settings));
                });

                if (colors) {
                    dispatch(setColors({colors}));
                }

                if (colorsConfig) {
                    dispatch(
                        setColorsConfig({
                            colorsConfig,
                        }),
                    );
                }

                if (labels) {
                    dispatch(setLabels({labels}));
                }

                if (shapes) {
                    dispatch(setShapes({shapes}));
                }

                if (shapesConfig) {
                    dispatch(
                        setShapesConfig({
                            shapesConfig,
                        }),
                    );
                }

                datalensGlobalState = getState();

                dispatch(
                    drawPreview({
                        withoutTable: false,
                    }),
                );

                dispatch(setStatus(AppStatus.Ready));
            } catch (error) {
                logger.logError('ql: initializeApplication failed', error);

                dispatch(
                    setError({
                        error,
                    }),
                );

                dispatch(setStatus(AppStatus.Failed));
            }
        } else {
            const datalensGlobalState = getState();

            const {
                ql: {settings, chartType, defaultPath},
            } = datalensGlobalState;

            const entryData = Helper.getEmptyTemplate();

            entry = {
                ...entryData,
                key: `${defaultPath || DL.USER_FOLDER}${i18n(
                    'editor.common.view',
                    'label_new-chart',
                )}`,
                workbookId: urlWorkbookId || null,
                fakeName: i18n('editor.common.view', 'label_new-chart'),
            };

            const {tabs} = Helper.createTabData();

            const {
                settings: newSettings,
                panes,
                grid,
            } = Helper.createGridData({
                tabs,
                entry,
                settings,
                gridSchemes: getGridSchemes(datalensGlobalState),
            });

            // Link to the chart from which the current chart was created (for Monitoring)
            let redirectUrl: string | undefined;

            // Queries by default
            const initialQueries: QLQuery[] = [];

            const initialParams: QLParam[] = [];

            // Did the user come from a link with a presetId?
            const presetId = urlSearch.get('presetId');
            if (presetId) {
                // Just in case, let's check that this is the interface for creating a new monitoringql chart
                let initialChartType = '';
                const urlChartType = location.pathname.match(/\/new\/([^?]+)(\?.+)?/);
                if (urlChartType) {
                    initialChartType = decodeURIComponent(urlChartType[1]) as QLChartType;
                }

                // If so, we load the preset from US and create a chart from it.
                if (initialChartType === QLChartType.Monitoringql) {
                    const getDefaultMonitoringQLConnectionId = registry.ql.functions.get(
                        'getDefaultMonitoringQLConnectionId',
                    );

                    const defaultMonitoringQLConnectionId = getDefaultMonitoringQLConnectionId(
                        DL.ENV,
                    );

                    try {
                        const loadedConnectionEntry = await getSdk().us.getEntry({
                            entryId: defaultMonitoringQLConnectionId,
                        });

                        if (!loadedConnectionEntry) {
                            throw new Error(i18n('sql', 'error_failed-to-load-default-connection'));
                        }

                        const connection: QLConnectionEntry =
                            loadedConnectionEntry as QLConnectionEntry;

                        connection.name = Utils.getEntryNameFromKey(connection.key);

                        dispatch(setConnection(connection));

                        const preset = await getSdk().us.getPreset({presetId});

                        if (preset?.data?.chart) {
                            preset.data.chart.targets.forEach((target) => {
                                initialQueries.push({
                                    value: target.query,
                                    params: [
                                        {
                                            name: 'project_id',
                                            type: 'string',
                                            defaultValue: target.scopeId,
                                        },
                                    ],
                                });
                            });
                        }

                        if (preset?.data?.redirectUrl) {
                            redirectUrl = preset.data.redirectUrl;
                        }

                        if (preset?.data?.chart?.settings) {
                            const mVisualizationId = preset.data.chart.settings['chart.type'];

                            let visualizationId = 'line';

                            // eslint-disable-next-line max-depth
                            switch (mVisualizationId) {
                                case 'auto':
                                    visualizationId = 'area';
                                    break;

                                case 'area':
                                    visualizationId = 'area';
                                    break;

                                case 'line':
                                    visualizationId = 'line';
                                    break;

                                case 'column':
                                    visualizationId = 'column';
                                    break;

                                default:
                                    visualizationId = 'area';
                            }

                            const availableVisualizations = getAvailableQlVisualizations();
                            const visualization =
                                availableVisualizations.find((someVisualization) => {
                                    return someVisualization.id === visualizationId;
                                }) || getDefaultQlVisualization();

                            dispatch(
                                setVisualizationWizard({
                                    visualization: visualization as Shared['visualization'],
                                }),
                            );

                            // eslint-disable-next-line max-depth
                            if (preset?.data?.params) {
                                // eslint-disable-next-line max-depth
                                if (typeof preset.data.params.from === 'number') {
                                    initialParams.push({
                                        name: 'from',
                                        type: 'datetime',
                                        defaultValue: moment(preset.data.params.from).toISOString(),
                                    });
                                } else if (typeof preset.data.params.from === 'string') {
                                    initialParams.push({
                                        name: 'from',
                                        type: 'datetime',
                                        defaultValue: preset.data.params.from,
                                    });
                                }

                                // eslint-disable-next-line max-depth
                                if (typeof preset.data.params.to === 'number') {
                                    initialParams.push({
                                        name: 'to',
                                        type: 'datetime',
                                        defaultValue: moment(preset.data.params.to).toISOString(),
                                    });
                                } else if (typeof preset.data.params.to === 'string') {
                                    initialParams.push({
                                        name: 'to',
                                        type: 'datetime',
                                        defaultValue: preset.data.params.to,
                                    });
                                }
                            }
                        }

                        dispatch(
                            setSettings({
                                chartType,
                                tabs,
                                queryValue: '',
                                queries: initialQueries,
                                settings: newSettings,
                                panes,
                                grid,
                                chart: null,
                                params: initialParams,
                                redirectUrl,
                            }),
                        );

                        dispatch(
                            setEntry({
                                entry,
                            }),
                        );

                        dispatch(setChartType(QLChartType.Monitoringql));

                        // It seems drawPreview before setStatus is better,
                        // since while the DOM will be rendered,
                        // the drawing request will be executed
                        dispatch(drawPreview());

                        dispatch(setStatus(AppStatus.Ready));
                    } catch (error) {
                        logger.logError('ql: setup failed', error);

                        dispatch(
                            setError({
                                error,
                            }),
                        );

                        dispatch(setStatus(AppStatus.Failed));
                    }
                }
            } else {
                dispatch(
                    setVisualizationWizard({
                        visualization: getDefaultQlVisualization() as Shared['visualization'],
                    }),
                );

                dispatch(
                    setSettings({
                        chartType,
                        tabs,
                        queryValue: '',
                        queries: initialQueries,
                        settings: newSettings,
                        panes,
                        grid,
                        chart: null,
                        params: [],
                    }),
                );

                dispatch(
                    setEntry({
                        entry,
                    }),
                );

                const connectionEntryId = urlSearch.get('connectionId');
                if (connectionEntryId) {
                    try {
                        // We request the connection for which the chart is built
                        const loadedConnectionEntry = await getSdk().us.getEntry({
                            entryId: connectionEntryId,
                        });

                        if (!loadedConnectionEntry) {
                            throw new Error(i18n('sql', 'error_failed-to-load-connection'));
                        }

                        const connection: QLConnectionEntry =
                            loadedConnectionEntry as QLConnectionEntry;

                        connection.name = Utils.getEntryNameFromKey(connection.key);

                        dispatch(setConnection(connection));

                        let newChartType;
                        AVAILABLE_CHART_TYPES.some((possibleChartType) => {
                            if (
                                AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE[
                                    possibleChartType
                                ].includes(connection.type as ConnectorType)
                            ) {
                                dispatch(setChartType(possibleChartType));

                                newChartType = possibleChartType;

                                return true;
                            } else {
                                return false;
                            }
                        });

                        if (newChartType === QLChartType.Sql) {
                            dispatch(
                                fetchConnectionSources({entryId: loadedConnectionEntry.entryId}),
                            );
                        }

                        const newLocationSearch = location.search
                            // Cut out the occurrence of connectionId=x, not forgetting to cut
                            .replace(/connectionId=[^&]+&?/, '')
                            // Cut out the remaining ?, if necessary
                            .replace(/\?$/, '');

                        history.replace({
                            search: newLocationSearch,
                        });

                        dispatch(setStatus(AppStatus.Ready));
                    } catch (error) {
                        logger.logError('ql: initial load failed', error);
                        dispatch(
                            setError({
                                error,
                            }),
                        );
                    }
                } else if (Utils.isEnabledFeature(Feature.QLPrometheus)) {
                    dispatch(setStatus(AppStatus.Unconfigured));
                } else {
                    dispatch(setChartType(QLChartType.Sql));
                    dispatch(setStatus(AppStatus.Ready));
                }
            }
        }
    };
};

type PerformManualConfigurationArgs = {
    connection: QLConnectionEntry;
    chartType?: QLChartType;
};

export const performManualConfiguration = ({
    connection,
    chartType,
}: PerformManualConfigurationArgs) => {
    // eslint-disable-next-line consistent-return
    return async function (dispatch: AppDispatch<QLAction>) {
        dispatch(fetchConnectionSources({entryId: connection.entryId}));

        const keyParts = connection.key.split('/');
        connection.name = keyParts[keyParts.length - 1];

        dispatch(setConnection(connection));

        if (chartType) {
            dispatch(setChartType(chartType));
        }

        dispatch(setStatus(AppStatus.Ready));
    };
};

export const onSuccessQlWidgetUpdate = (entry: Entry) => {
    return (dispatch: AppDispatch<QLAction>) => {
        if (!entry.data) {
            throw new Error(i18n('sql', 'error_failed-to-save-chart'));
        }

        entry.data = {
            shared: JSON.parse(entry.data.shared),
        };

        dispatch(
            setEntry({
                entry: entry as QLEntry,
            }),
        );
    };
};

export const onErrorQlWidgetUpdate = (error: AxiosError) => {
    return (dispatch: AppDispatch<QLAction>) => {
        dispatch(setError({error}));
    };
};

export const onErrorSetActualChartRevision = (error: AxiosError) => {
    return (dispatch: AppDispatch<QLAction>) => {
        dispatch(setEntry({entry: null}));
        dispatch(setError({error}));
    };
};

export const updateChart = (data: QLEntryDataShared, mode?: EntryUpdateMode) => {
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        const {entry} = getState().ql;

        if (!entry) {
            return;
        }

        await dispatch(
            saveWidget<QLEntryDataShared, Entry>({
                entry,
                mode,
                data,
                template: 'ql',
                onError: (error) => dispatch(onErrorQlWidgetUpdate(error)),
                onSuccess: (responseData) => dispatch(onSuccessQlWidgetUpdate(responseData)),
            }),
        );
    };
};

export const setQlChartActualRevision = (isDraft?: boolean) => {
    return async function (dispatch: AppDispatch<QLAction>, getState: () => DatalensGlobalState) {
        const state = getState();

        const initialData = selectInitalQlChartConfig(state);
        const entry = getEntry(state);

        if (!initialData || !entry) {
            return;
        }

        await dispatch(
            setActualChart<QLEntryDataShared, Entry>({
                entry,
                template: 'ql',
                data: prepareChartDataBeforeSave(initialData),
                isDraftEntry: Boolean(isDraft),
                onRequestSuccess: (responseData) => dispatch(onSuccessQlWidgetUpdate(responseData)),
                onRequestError: (error) => dispatch(onErrorQlWidgetUpdate(error)),
                onSetActualError: (error) => dispatch(onErrorSetActualChartRevision(error)),
            }),
        );
    };
};
