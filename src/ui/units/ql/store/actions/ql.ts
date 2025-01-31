import type {AxiosError} from 'axios';
import type {History, Location} from 'history';
import {I18n, i18n} from 'i18n';
import _ from 'lodash';
import type {match as Match} from 'react-router-dom';
import {mapQlConfigToLatestVersion} from 'shared/modules/config/ql';
import {getTranslationFn} from 'shared/modules/language';
import type {
    QLConfigQuery,
    QlConfig,
    QlConfigParam,
    QlConfigResultEntryMetadataDataColumnOrGroup,
} from 'shared/types/config/ql';
import {addEditHistoryPoint} from 'ui/store/actions/editHistory';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {
    CommonSharedExtraSettings,
    ConnectorType,
    Dataset,
    EntryUpdateMode,
    Field,
    QlConfigPreviewTableData,
    Shared,
    WorkbookId,
} from '../../../../../shared';
import {
    ENTRY_TYPES,
    Feature,
    QLChartType,
    resolveIntervalDate,
    resolveOperation,
} from '../../../../../shared';
import type {GetEntryArgs} from '../../../../../shared/schema';
import type {DatalensGlobalState, Entry} from '../../../../index';
import {DL, URL_QUERY, Utils} from '../../../../index';
import {navigateHelper} from '../../../../libs';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {registry} from '../../../../registry';
import type {AppDispatch} from '../../../../store';
import {saveWidget, setActualChart} from '../../../../store/actions/chartWidget';
import {UrlSearch, getUrlParamFromStr} from '../../../../utils';
import {
    resetWizardStore,
    setVisualizationPlaceholderItems,
    setVisualization as setVisualizationWizard,
} from '../../../wizard/actions';
import {setDataset} from '../../../wizard/actions/dataset';
import {
    setAvailable,
    setColors,
    setColorsConfig,
    setDistincts,
    setLabels,
    setPointConflict,
    setShapes,
    setShapesConfig,
    updatePlaceholderSettings,
} from '../../../wizard/actions/visualization';
import {setExtraSettings as setWizardExtraSettings} from '../../../wizard/actions/widget';
import type {VisualizationStatus} from '../../constants';
import {
    AVAILABLE_CHART_TYPES,
    AppStatus,
    ConnectionStatus,
    QL_EDIT_HISTORY_UNIT_ID,
    QL_MOCKED_DATASET_ID,
} from '../../constants';
import {prepareChartDataBeforeSave} from '../../modules/helpers';
import {getDefaultQlVisualization, getQlVisualization} from '../../utils/visualization';
import {
    getEntry,
    getGridSchemes,
    getPreviewData,
    getValid,
    selectInitalQlChartConfig,
} from '../reducers/ql';
import type {
    QLChart,
    QLConnectionEntry,
    QLDispatch,
    QLEntry,
    QLGrid,
    QLPanes,
    QLSettings,
    QLState,
    QLTabs,
} from '../typings/ql';
import {Helper} from '../utils/grid';
import {prepareMonitoringPreset} from '../utils/monitoring';

export const SET_CHART_TYPE = Symbol('ql/SET_CHART_TYPE');
export const SET_STATUS = Symbol('ql/SET_STATUS');
export const SET_ERROR = Symbol('ql/SET_ERROR');
export const SET_SETTINGS = Symbol('ql/SET_SETTINGS');
export const SET_DEFAULT_PATH = Symbol('ql/SET_DEFAULT_PATH');
export const SET_ENTRY = Symbol('ql/SET_ENTRY');
export const SET_ENTRY_KEY = Symbol('ql/SET_ENTRY_KEY');
export const SET_EXTRA_SETTINGS = Symbol('ql/SET_EXTRA_SETTINGS');
export const SET_QUERY_METADATA = Symbol('ql/SET_QUERY_METADATA');
export const SET_TABLE_PREVIEW_DATA = Symbol('ql/SET_TABLE_PREVIEW_DATA');
export const SET_VISUALIZATION_STATUS = Symbol('ql/SET_VISUALIZATION_STATUS');
export const SET_CONNECTION_STATUS = Symbol('ql/SET_CONNECTION_STATUS');
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
export const SET_QL_STORE = Symbol('ql/SET_QL_STORE');

// Action functions and interfaces

export function resetQLStore() {
    return {
        type: RESET_QL_STORE,
    };
}

export function setQLStore({store}: {store: QLState}) {
    return {
        type: SET_QL_STORE,
        store,
    };
}

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
    queries: QLConfigQuery[];
    settings: QLSettings;
    panes: QLPanes;
    grid: QLGrid;
    chart: QLChart | null;
    params: QlConfigParam[];
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

export const updateParam = ({param, index}: {param: QlConfigParam; index: number}) => {
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
    param: QlConfigParam;
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

export const updateQuery = ({query, index}: {query: QLConfigQuery; index: number}) => {
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
        order: QlConfigResultEntryMetadataDataColumnOrGroup;
        visualization?: any;
        available?: Field[];
        colors?: Field[];
        labels?: Field[];
        shapes?: Field[];
        distincts?: Record<string, string[]>;
        pointConflict?: boolean;
    };
}

export const setQueryMetadata = ({metadata}: SetQueryMetadataProps) => {
    return async function (dispatch: QLDispatch, getState: () => DatalensGlobalState) {
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

                if (placeholder.settings) {
                    dispatch(updatePlaceholderSettings(placeholder.id, placeholder.settings));
                }
            });

            if (metadata.colors) {
                dispatch(setColors({colors: metadata.colors}));
            }

            if (metadata.labels) {
                dispatch(setLabels({labels: metadata.labels}));
            }

            if (metadata.shapes) {
                dispatch(setShapes({shapes: metadata.shapes}));
            }

            if (metadata.available) {
                dispatch(setAvailable({available: metadata.available}));
            }

            if (metadata.distincts) {
                dispatch(setDistincts({distincts: metadata.distincts}));
            }

            dispatch(setPointConflict({pointConflict: metadata.pointConflict}));

            dispatch(
                setColumnsOrder({
                    order: null,
                }),
            );
        }
    };
};

interface SetTablePreviewDataProps {
    tablePreviewData: QlConfigPreviewTableData;
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

export const setConnectionStatus = (connectionStatus: ConnectionStatus) => {
    return {
        type: SET_CONNECTION_STATUS,
        connectionStatus,
    };
};

export const toggleTablePreview = () => {
    return {
        type: TOGGLE_TABLE_PREVIEW,
    };
};

interface SetColumnsOrderProps {
    order: QlConfigResultEntryMetadataDataColumnOrGroup[] | null;
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

export const setQlEntryKey = (key: string) => {
    return {
        type: SET_ENTRY_KEY,
        payload: key,
    };
};

export const drawPreview = ({withoutTable}: {withoutTable?: boolean} = {}) => {
    return (dispatch: QLDispatch, getState: () => DatalensGlobalState) => {
        const previewData = getPreviewData(getState());

        dispatch({
            type: DRAW_PREVIEW,
            withoutTable: withoutTable || false,
            previewData,
        });

        // Note, that QL uses QL store and Wizard store, because QL and Wizard use same visualization section
        dispatch(
            addEditHistoryPoint({
                unitId: QL_EDIT_HISTORY_UNIT_ID,
                newState: {
                    ql: getState().ql,
                    wizard: getState().wizard,
                },
            }),
        );
    };
};

export const drawPreviewIfValid = ({withoutTable}: {withoutTable?: boolean} = {}) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const valid = getValid(getState());

        if (valid) {
            dispatch(drawPreview({withoutTable}));
        }
    };
};

const applyUrlParams = (params: QlConfigParam[]) => {
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

type FetchConnectionSourcesArgs = {
    entryId: string;
    workbookId: WorkbookId;
};

export const fetchConnectionSources = ({entryId, workbookId}: FetchConnectionSourcesArgs) => {
    return async function (dispatch: QLDispatch) {
        // Requesting information about connection sources
        const {sources: connectionSources, freeform_sources: connectionFreeformSources} =
            await getSdk().sdk.bi.getConnectionSources({
                connectionId: entryId,
                workbookId,
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
    };
};

type FetchConnectionSourceSchemaArgs = {
    tableName: string;
};

export const fetchConnectionSourceSchema = ({tableName}: FetchConnectionSourceSchemaArgs) => {
    return async function (dispatch: QLDispatch, getState: () => DatalensGlobalState) {
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

            const {raw_schema: schema} = await getSdk().sdk.bi.getConnectionSourceSchema({
                connectionId: connection!.entryId,
                workbookId: connection!.workbookId ?? null,
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
    // eslint-disable-next-line complexity
    return async function (dispatch: QLDispatch, getState: () => DatalensGlobalState) {
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

        const {extractEntryId} = registry.common.functions.getAll();
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

                const loadedEntry = await getSdk().sdk.us.getEntry(getEntryArgs);

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
                    entry.data.shared = mapQlConfigToLatestVersion(
                        JSON.parse(loadedEntry.data.shared),
                        {i18n: getTranslationFn(I18n)},
                    );
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

                // By default ChartType === 'sql', since there were only sql charts before
                const chartType = entry?.data.shared.chartType || 'sql';

                const {
                    connection: {entryId: connectionEntryId},
                } = entry.data.shared;

                let connection: QLConnectionEntry | null = null;

                try {
                    // We request the connection for which the chart is built
                    const loadedConnectionEntry = await getSdk().sdk.us.getEntry({
                        entryId: connectionEntryId,
                    });

                    if (loadedConnectionEntry) {
                        connection = loadedConnectionEntry as QLConnectionEntry;

                        const keyParts = connection.key.split('/');
                        connection.name = keyParts[keyParts.length - 1];

                        dispatch(setConnection(connection));

                        dispatch(setConnectionStatus(ConnectionStatus.Ready));

                        if (chartType === QLChartType.Sql) {
                            dispatch(
                                fetchConnectionSources({
                                    entryId: loadedConnectionEntry.entryId,
                                    workbookId: loadedConnectionEntry.workbookId,
                                }),
                            );
                        }
                    }
                } catch (e) {
                    dispatch(setConnectionStatus(ConnectionStatus.Failed));
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

                const {placeholders: loadedVisualizationPlaceholders} = loadedVisualization;

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

                const visualization = getQlVisualization(loadedVisualization);

                dispatch(
                    setVisualizationWizard({
                        visualization: visualization,
                    }),
                );

                // We will put down the legacy-order, if there is one
                // When you save the chart, it will be deleted and you can forget about it
                if (order) {
                    dispatch(
                        setColumnsOrder({
                            order: order || null,
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

                dispatch(setStatus(AppStatus.Ready));

                datalensGlobalState = getState();

                dispatch(
                    drawPreviewIfValid({
                        withoutTable: false,
                    }),
                );
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
                        const loadedConnectionEntry = await getSdk().sdk.us.getEntry({
                            entryId: defaultMonitoringQLConnectionId,
                        });

                        if (!loadedConnectionEntry) {
                            throw new Error(i18n('sql', 'error_failed-to-load-default-connection'));
                        }

                        const connection: QLConnectionEntry =
                            loadedConnectionEntry as QLConnectionEntry;

                        connection.name = Utils.getEntryNameFromKey(connection.key);

                        dispatch(setConnection(connection));

                        const preset = await getSdk().sdk.us.getPreset({presetId});

                        const {initialQueries, initialParams, redirectUrl, visualization} =
                            prepareMonitoringPreset(preset);

                        dispatch(
                            setVisualizationWizard({
                                visualization,
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
                        queries: [],
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
                        const loadedConnectionEntry = await getSdk().sdk.us.getEntry({
                            entryId: connectionEntryId,
                        });

                        if (!loadedConnectionEntry) {
                            throw new Error(i18n('sql', 'error_failed-to-load-connection'));
                        }

                        const connection: QLConnectionEntry =
                            loadedConnectionEntry as QLConnectionEntry;

                        connection.name = Utils.getEntryNameFromKey(connection.key);

                        dispatch(setConnection(connection));

                        const {getConnectionsByChartType} = registry.ql.functions.getAll();

                        let newChartType;
                        AVAILABLE_CHART_TYPES.some((possibleChartType) => {
                            if (
                                getConnectionsByChartType(possibleChartType).includes(
                                    connection.type as ConnectorType,
                                )
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
                                fetchConnectionSources({
                                    entryId: loadedConnectionEntry.entryId,
                                    workbookId: loadedConnectionEntry.workbookId,
                                }),
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
                } else if (isEnabledFeature(Feature.QLPrometheus)) {
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
    return async function (dispatch: QLDispatch) {
        dispatch(
            fetchConnectionSources({
                entryId: connection.entryId,
                workbookId: connection.workbookId,
            }),
        );

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
    return (dispatch: QLDispatch) => {
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
    return (dispatch: QLDispatch) => {
        dispatch(setError({error}));
    };
};

export const onErrorSetActualChartRevision = (error: AxiosError) => {
    return (dispatch: QLDispatch) => {
        dispatch(setEntry({entry: null}));
        dispatch(setError({error}));
    };
};

export const updateChart = (data: QlConfig, mode?: EntryUpdateMode) => {
    return async function (dispatch: QLDispatch, getState: () => DatalensGlobalState) {
        const {entry} = getState().ql;

        if (!entry) {
            return;
        }

        await dispatch(
            saveWidget<QlConfig, Entry>({
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
    return async function (dispatch: QLDispatch, getState: () => DatalensGlobalState) {
        const state = getState();

        const initialData = selectInitalQlChartConfig(state);
        const entry = getEntry(state);

        if (!initialData || !entry) {
            return;
        }

        await dispatch(
            setActualChart<QlConfig, Entry>({
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

export const updateQueryAndRedraw = ({query, index}: {query: QLConfigQuery; index: number}) => {
    return (dispatch: AppDispatch) => {
        dispatch(updateQuery({query, index}));
        dispatch(drawPreviewIfValid());
    };
};

export const removeQueryAndRedraw = ({index}: {index: number}) => {
    return (dispatch: AppDispatch) => {
        dispatch(removeQuery({index}));
        dispatch(drawPreviewIfValid());
    };
};
