import {DL} from 'constants/common';

import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource} from 'axios';
import axios from 'axios';
import type {Series as HighchartSeries} from 'highcharts';
import Highcharts from 'highcharts';
import {i18n} from 'i18n';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {stringify} from 'qs';
import type {
    ChartsStats,
    DashChartRequestContext,
    StringParams,
    WizardType,
    WorkbookId,
} from 'shared';
import {
    ControlType,
    DL_COMPONENT_HEADER,
    DL_EMBED_TOKEN_HEADER,
    DashLoadPriority,
    DashTabItemControlSourceType,
    DlComponentHeader,
    ErrorCode,
    Feature,
    MAX_SEGMENTS_NUMBER,
    WidgetKind,
} from 'shared';
import {isEmbeddedEntry} from 'ui/utils/embedded';

import type {ChartWidgetData} from '../../../../../components/Widgets/Chart/types';
import {registry} from '../../../../../registry';
import type {WidgetType} from '../../../../../units/dash/modules/constants';
import Utils from '../../../../../utils';
import {chartToTable} from '../../../ChartKit/helpers/d3-chart-to-table';
import {isNavigatorSerie} from '../../../ChartKit/modules/graph/config/config';
import type {
    ChartKitLoadSuccess,
    ChartKitProps,
} from '../../../components/ChartKitBase/ChartKitBase';
import type {
    ControlsOnlyWidget,
    DataProvider,
    GraphWidget,
    TableWidgetData,
    Widget,
} from '../../../types';
import axiosInstance, {initConcurrencyManager} from '../../axios/axios';
import {REQUEST_ID_HEADER, TRACE_ID_HEADER, URL_OPTIONS} from '../../constants/constants';
import type {ExtraParams} from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import DatalensChartkitCustomError, {
    ERROR_CODE,
} from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import URI from '../../uri/uri';

import {getGraph} from './get-graph/get-graph';
import processNode from './node';
import type {
    ChartsData,
    ChartsProps,
    LogItem,
    Logs,
    ResponseError,
    ResponseSourcesSuccess,
    ResponseSuccess,
    ResponseSuccessControls,
    ResponseSuccessNode,
    ResponseSuccessNodeBase,
    Settings,
    SourcesConfig,
} from './types';
import processWizard from './wizard';

// from export-data module
declare module 'highcharts' {
    interface Chart {
        getDataRows(multiLevelHeaders?: boolean): Array<Array<number | string>>;
    }
}

export const CHARTS_ERROR_CODE = {
    CONFIG_LOADING_ERROR: 'ERR.CHARTS.CONFIG_LOADING_ERROR',
    DEPS_RESOLVE_ERROR: 'ERR.CHARTS.DEPS_RESOLVE_ERROR',
    DATA_FETCHING_ERROR: 'ERR.CHARTS.DATA_FETCHING_ERROR',
    RUNTIME_ERROR: 'ERR.CHARTS.RUNTIME_ERROR',
    RUNTIME_TIMEOUT_ERROR: 'ERR.CHARTS.RUNTIME_TIMEOUT',
    ROWS_NUMBER_OVERSIZE: 'ERR.CHARTS.ROWS_NUMBER_OVERSIZE',
    TABLE_OVERSIZE: 'ERR.CHARTS.TABLE_OVERSIZE',
    SEGMENTS_OVERSIZE: 'ERR.CHARTS.SEGMENTS_OVERSIZE',
    PROCESSING_ERROR: 'ERR.CK.PROCESSING_ERROR',
    UNSUPPORTED_TYPE: 'ERR.CHARTS.UNSUPPORTED_TYPE',
    UNSUPPORTED_DATA_TYPE: 'ERR.CHARTS.UNSUPPORTED_DATA_TYPE',
    SECRETS_ACCESS: 'ERR.CHARTS.SECRETS_ACCESS',
} as const;

type EntitiesType =
    | 'text_node'
    | 'graph_node'
    | 'graph_wizard_node'
    | 'd3_wizard_node'
    | 'table_node'
    | 'table_wizard_node'
    | 'metric_node'
    | 'metric_wizard_node'
    | 'ymap_node'
    | 'ymap_wizard_node'
    | 'markdown_node'
    | 'markup_node'
    | 'markup_wizard_node'
    | 'markup_ql_node'
    | 'control_node'
    | 'map_node'
    | ControlType.Dash;

export type EntityConfig = {
    data: Object | undefined;
    meta: {stype: EntitiesType | WizardType | undefined};
    createdAt?: string;
};

export interface EntityRequestOptions {
    data: {
        config: EntityConfig | undefined;
        widgetType?: DashTabItemControlSourceType | WidgetType;
        params: StringParams | undefined;
        id?: string;
        key?: string;
        path?: string | undefined;
        uiOnly?: boolean;
        tabId?: string;
        responseOptions?: {
            includeConfig?: boolean;
            includeLogs?: boolean;
        };
        controlData?: {
            id: string;
            tabId?: string;
            groupId?: string;
        };
        workbookId?: WorkbookId;
    };
    headers?: Record<string, any>;
    cancelToken?: CancelTokenSource['token'];
    'axios-retry'?: {
        retries: number;
    };
}

const STATS_COLLECT_TIMEOUT = 5 * 1000;

const CANCEL_REQUEST_CODE = 'REQUEST_CANCELED';

function isResponseSuccessNode(data: ResponseSuccess): data is ResponseSuccessNode {
    return 'type' in data;
}

class ChartsDataProvider implements DataProvider<ChartsProps, ChartsData, CancelTokenSource> {
    static printLogs(logs?: string) {
        if (!logs) {
            return;
        }

        const engineLogs: Logs = JSON.parse(logs, (_: string, value: string) => {
            if (value === '__ee_special_value__NaN') {
                return NaN;
            }
            if (value === '__ee_special_value__Infinity') {
                return Infinity;
            }
            if (value === '__ee_special_value__-Infinity') {
                return -Infinity;
            }

            return value;
        });

        Object.entries<LogItem[][] | undefined>(engineLogs).forEach(([key, value]) => {
            /* eslint-disable no-console */
            if (value && value.length) {
                console.group(key);
                value.forEach((log) => {
                    const logValues = log.map((logItem) => logItem.value);
                    console.log(...logValues);
                });
                console.groupEnd();
                /* eslint-enable no-console */
            }
        });
    }

    static formatError(
        originalError: ResponseError['error'] & {
            extra?: {logs_v2?: string; sources?: ResponseSourcesSuccess; hideRetry?: boolean};
        },
        isEditMode: boolean,
    ) {
        let message = '';
        const code = originalError.code;
        let details: DatalensChartkitCustomError['details'] =
            'details' in originalError ? originalError.details : {};
        // @ts-ignore
        let debug: DatalensChartkitCustomError['debug'] =
            'debug' in originalError ? originalError.debug : {};
        const extra: ExtraParams = {
            ...(originalError.extra || {}),
            hideRetry: originalError.extra?.hideRetry || false,
            openedMore: isEditMode,
            showErrorMessage: true,
            showMore: false,
        };

        switch (originalError.code) {
            case CHARTS_ERROR_CODE.CONFIG_LOADING_ERROR:
                switch (originalError.details.code) {
                    case 403:
                        message = i18n('chartkit.data-provider', 'error-no-view-rights');
                        debug = details;
                        details = {};
                        extra.hideDebugInfo = true;
                        break;
                    case 404:
                        message = i18n('chartkit.data-provider', 'error-not-found');
                        debug = details;
                        details = {};
                        extra.hideRetry = false;
                        extra.hideDebugInfo = true;
                        break;
                    default:
                        message = i18n('chartkit.data-provider', 'error-not-loaded');
                        break;
                }
                break;
            case CHARTS_ERROR_CODE.DEPS_RESOLVE_ERROR:
            case CHARTS_ERROR_CODE.RUNTIME_ERROR: {
                message = i18n('chartkit.data-provider', 'error-execution');
                details = pick(originalError.details, 'stackTrace', 'description');
                debug = Object.assign(
                    debug,
                    omit(originalError.details, 'stackTrace', 'description'),
                );
                extra.hideDebugInfo = true;
                break;
            }
            case CHARTS_ERROR_CODE.RUNTIME_TIMEOUT_ERROR: {
                message = i18n('chartkit.data-provider', 'error-runtime-timeout');
                extra.hideRetry = false;
                extra.showMore = true;
                debug.code = originalError.code;
                break;
            }
            case CHARTS_ERROR_CODE.DATA_FETCHING_ERROR: {
                message = i18n('chartkit.data-provider', 'error-data-fetching');

                const detailsSources = Object.entries(originalError.details.sources);

                details = detailsSources.reduce((result: Record<string, object>, [key, value]) => {
                    const body =
                        typeof value.body === 'string' ? {response: value.body} : value.body;

                    const preparedError = {
                        code: value.code,
                        status: value.status,
                        sourceType: value.sourceType,
                        message: value.message,
                        details: value.details,
                        ...body,
                    };

                    if (preparedError.code === ErrorCode.ChytTableAccessDenied) {
                        message = i18n('chartkit.data-provider', 'error-chyt-table-access');
                        extra.openedMore = false;
                        extra.showErrorMessage = false;
                    }

                    result[key] = preparedError;
                    return result;
                }, {});

                debug.sources = originalError.details.sources;

                break;
            }
            case CHARTS_ERROR_CODE.ROWS_NUMBER_OVERSIZE:
                message = i18n('chartkit.data-provider', 'error-too-many-rows');
                extra.hideRetry = false;
                break;
            case CHARTS_ERROR_CODE.TABLE_OVERSIZE: {
                const detailsType = details.type as 'cells' | 'columns';
                const type = i18n('chartkit.data-provider', `error-oversize_${detailsType}`);
                message = i18n('chartkit.data-provider', 'error-oversize-table', {
                    type,
                });
                extra.hideRetry = false;

                delete details.type;
                break;
            }
            case CHARTS_ERROR_CODE.SEGMENTS_OVERSIZE: {
                message = i18n('chartkit.data-provider', 'error-oversize-segments', {
                    maxNumber: MAX_SEGMENTS_NUMBER,
                });
                extra.hideRetry = false;
                break;
            }
            case CHARTS_ERROR_CODE.SECRETS_ACCESS:
                message = i18n('chartkit.data-provider', 'error-secrets-access');
                details = {};
                break;
            case CHARTS_ERROR_CODE.UNSUPPORTED_DATA_TYPE:
                message = i18n('chartkit.data-provider', 'error-unsupported-data-type');
                extra.hideRetry = true;
                break;
        }

        return new DatalensChartkitCustomError(message, {code, details, debug, extra});
    }

    static graphToTable(graph: GraphWidget & ChartsData): TableWidgetData & ChartsData {
        // it looks expensive, but less labor-intensive than trying to parse all possible data options at the lines
        // @ts-ignore
        // TODO@types
        const chart = Highcharts.chart(
            document.createElement('div'),
            getGraph(Object.assign({highcharts: graph.libraryConfig}, graph.config), graph.data)
                .config,
        );

        const dataRows = chart.getDataRows();

        const head: TableWidgetData['data']['head'] = [];
        const rows: TableWidgetData['data']['rows'] = [];

        if (chart.xAxis[0].options.type === 'datetime') {
            head.push({
                id: 'date',
                name: i18n('chartkit.data-provider', 'date'),
                type: 'date',
            });
        } else {
            head.push({
                id: 'categories',
                name: i18n('chartkit.data-provider', 'categories'),
                type: 'text',
            });
        }

        const [firstRow, ...restRows] = dataRows;
        const [, ...restHead] = firstRow;

        restHead.forEach((name) => {
            head.push({
                id: name.toString(),
                name: name.toString(),
                type: 'number',
                view: 'number',
                precision: graph.config.precision,
            });
        });

        restRows.forEach((values) => {
            rows.push({values});
        });

        return {
            // TODO: in theory, you need to pick keys from WidgetBase and omit the libraryConfig key
            ...graph,
            type: 'table',
            config: {
                sort: head[0].id,
                order: 'desc',
            },
            data: {
                head,
                rows,
            },
        };
    }

    static postProcess(processed: Widget & ChartsData): Widget & ChartsData {
        const denormalizedParams = Object.keys(processed.params).reduce(
            (result: Record<string, string>, key) => {
                const value = processed.params[key];
                result[key] = Array.isArray(value) && value.length ? value[0] : (value as string);
                return result;
            },
            {},
        );
        /** @depreacted _editor_type to support links from the Stat */
        const chartType = denormalizedParams['_chart_type'] || denormalizedParams['_editor_type'];

        if (chartType === WidgetKind.Table) {
            switch (processed.type) {
                case WidgetKind.Graph: {
                    return ChartsDataProvider.graphToTable(processed);
                }
                case WidgetKind.D3: {
                    return {
                        ...processed,
                        type: 'table',
                        data: chartToTable({chartData: processed.data as ChartKitWidgetData}),
                    } as Widget & ChartsData;
                }
            }
        }

        if (processed.type === 'graph') {
            const newConfig: GraphWidget['config'] = {
                hideComments:
                    denormalizedParams[URL_OPTIONS.HIDE_COMMENTS] === '1' ||
                    (processed.config.hideComments &&
                        denormalizedParams[URL_OPTIONS.HIDE_COMMENTS] !== '0'),
                hideHolidays: denormalizedParams[URL_OPTIONS.HIDE_HOLIDAYS] === '1',
                normalizeDiv: denormalizedParams[URL_OPTIONS.NORMALIZE_DIV] === '1',
                normalizeSub: denormalizedParams[URL_OPTIONS.NORMALIZE_SUB] === '1',
            };

            const withoutLineLimit = denormalizedParams[URL_OPTIONS.WITHOUT_LINE_LIMIT];
            if (withoutLineLimit !== undefined) {
                newConfig.withoutLineLimit = Boolean(withoutLineLimit);
            }

            const title = denormalizedParams['_graph_title'];
            if (title) {
                newConfig.title = title.toString();
            }

            const subtitle = denormalizedParams['_graph_subtitle'];
            if (subtitle) {
                newConfig.subtitle = subtitle.toString();
            }

            if (denormalizedParams['_highstock_start'] || denormalizedParams['_highstock_end']) {
                newConfig.highstock = {
                    override_range_min: parseInt(denormalizedParams['_highstock_start'], 10),
                    override_range_max: parseInt(denormalizedParams['_highstock_end'], 10),
                };
            }

            return {
                ...processed,
                config: {
                    ...processed.config,
                    ...newConfig,
                },
            };
        }

        return processed;
    }

    static gatherStats(input: ChartKitLoadSuccess<ChartsData>['data'] & {requestId: string}) {
        const {loadedData, widgetRendering, yandexMapAPIWaiting, requestId} = input;

        const widget = ('widgetData' in input ? input.widgetData : input.widget) as ChartWidgetData;

        const stats: ChartsStats = {
            url: window.location.href,
            requestId,
            groupId: null,
            scope: null,
            entryId: loadedData.entryId,
            query: stringify(loadedData.params, {arrayFormat: 'repeat'}),
            type: loadedData.type,
            widgetRendering,
            yandexMapAPIWaiting,
            sourcesCount: Object.keys(loadedData.sources).length,
            pointsCount: null,
            seriesCount: null,
            graphType: null,
            mixedGraphType: null,
            columnsCount: null,
            rowsCount: null,
            configResolving: null,
            dataFetching: null,
            jsExecution: null,
        };

        if (loadedData.timings) {
            Object.assign(stats, loadedData.timings);
        }

        if (['graph', 'timeseries'].includes(loadedData.type) && widget && 'series' in widget) {
            let pointsCount = 0;
            const graphType: {[key: string]: number} = {};

            if (loadedData.type === 'graph') {
                const series = widget.series as HighchartSeries[];
                series
                    .filter((serie) => !isNavigatorSerie(serie))
                    .forEach((serie) => {
                        const data = serie.options.data as number[];
                        pointsCount += (data && data.length) || 0;
                        graphType[serie.type] = (graphType[serie.type] || 0) + 1;
                    });
                stats.seriesCount = (widget.series as HighchartSeries[]).length || 0;
            } else {
                const options = widget.options;
                // TODO: add the correct types
                const series = widget.series as any[];
                const defaultChartType =
                    (loadedData as Widget).libraryConfig?.chart?.series?.type || 'line';
                series.forEach((serie, i) => {
                    pointsCount += serie.length;
                    const sOptions = options?.series?.[i];
                    if (sOptions) {
                        const gType = sOptions.type || defaultChartType;
                        graphType[gType] = (graphType[gType] || 0) + 1;
                    }
                });
                stats.seriesCount = (widget.series as HighchartSeries[]).length || 0 - 1;
            }

            const sortedGraphType = Object.entries(graphType).sort((a, b) => b[1] - a[1])[0][0];

            stats.pointsCount = pointsCount;

            stats.mixedGraphType = Object.keys(graphType).length > 1 ? 1 : 0;
            stats.graphType = JSON.stringify(sortedGraphType);
        }

        if (loadedData.type === 'table' && loadedData.data.rows) {
            const firstRow = loadedData.data.rows.length && loadedData.data.rows[0];
            if (firstRow) {
                // TODO: still take from data.columns, because there may be no data in the table
                stats.columnsCount = (('values' in firstRow && firstRow.values.length) ||
                    ('cells' in firstRow && firstRow.cells.length)) as number;
                stats.rowsCount = loadedData.data.rows.length;
            }
        }

        return stats;
    }

    private settings: Settings = {
        endpoint: '/',
        lang: 'ru',
        noRetry: false,
    };

    private endpointCounter = 0;

    private collectStatsBatchQueue: ChartsStats[] = [];

    private collectStatsTimerId: number | null = null;

    private get requestEndpoint() {
        if (Array.isArray(this.settings.endpoint)) {
            return this.settings.endpoint[this.endpointCounter++ % this.settings.endpoint.length];
        }
        return this.settings.endpoint;
    }

    get endpoint() {
        return Array.isArray(this.settings.endpoint)
            ? this.settings.endpoint[0]
            : this.settings.endpoint;
    }
    // @ts-ignore Moving to TS 4.9. Improve generics
    setSettings = (newSettings: Partial<Settings>) => {
        if ('maxConcurrentRequests' in newSettings) {
            initConcurrencyManager(newSettings.maxConcurrentRequests || Infinity);
        }

        Object.assign(this.settings, newSettings);
        if (Array.isArray(this.settings.endpoint)) {
            this.settings.endpoint = this.settings.endpoint.map((value) =>
                value.replace(/\/$/, ''),
            );
        } else {
            this.settings.endpoint = this.settings.endpoint.replace(/\/$/, '');
        }
    };

    // CHARTS-2284
    // compare only by fields registered in some static field or take ChartsProps keys
    isEqualProps(a: ChartsProps, b: ChartsProps) {
        return isEqual(a, b);
    }

    getRequestCancellation() {
        return axios.CancelToken.source();
    }

    cancelRequests(requestCancellation: CancelTokenSource) {
        if (requestCancellation) {
            requestCancellation.cancel(CANCEL_REQUEST_CODE);
        }
    }

    async getWidget({
        props,
        contextHeaders,
        requestId,
        requestCancellation,
    }: {
        props: ChartsProps;
        contextHeaders?: DashChartRequestContext;
        requestId: string;
        requestCancellation: CancelTokenSource;
    }) {
        const loaded = await this.load({
            data: props,
            contextHeaders,
            requestId,
            requestCancellation,
        });

        if (loaded) {
            // @ts-ignore
            if (loaded.NO_DATA_AVAILABLE_HERE) {
                throw new DatalensChartkitCustomError(
                    i18n('chartkit.data-provider', 'error-unsupported-type'),
                    {
                        code: CHARTS_ERROR_CODE.UNSUPPORTED_TYPE,
                        extra: {hideRetry: true},
                    },
                );
            }

            const processed = isResponseSuccessNode(loaded)
                ? await processNode<ResponseSuccessNode, Widget>(loaded, this.settings.noJsonFn)
                : // @ts-ignore Types from the js file are incorrect
                  processWizard(loaded);

            return ChartsDataProvider.postProcess(processed);
        }

        return null;
    }

    async runAction({
        props,
        contextHeaders,
        requestId,
    }: {
        props: ChartsProps;
        contextHeaders?: DashChartRequestContext;
        requestId: string;
    }) {
        const {
            id,
            source,
            params,
            widgetType,
            config: {type, data: configData, key, createdAt} = {},
            workbookId,
        } = props;

        const isEditMode = Boolean(type && configData);
        const includeLogs = this.settings.includeLogs || isEditMode;

        try {
            const result = await this.makeRequest({
                url: `${DL.API_PREFIX}/run-action`,
                data: {
                    id,
                    key,
                    path: source,
                    params,
                    widgetType,
                    config: isEditMode
                        ? {
                              data: configData,
                              createdAt: createdAt,
                              meta: {stype: type},
                          }
                        : undefined,
                    responseOptions: {
                        includeLogs,
                    },
                    workbookId,
                },
                headers: this.getLoadHeaders(requestId, contextHeaders),
            });
            const responseData: ResponseSuccess = result.data;
            const headers = result.headers;

            return this.getExtendedResponse({responseData, headers, includeLogs});
        } catch (error) {
            return this.processError({
                error,
                requestId,
                includeLogs,
                isEditMode,
            });
        }
    }

    async getControls({
        props,
        contextHeaders,
        requestId,
        requestCancellation,
    }: {
        props: ChartsProps;
        contextHeaders?: DashChartRequestContext;
        requestId: string;
        requestCancellation: CancelTokenSource;
    }) {
        const loaded = await this.load({
            data: props,
            contextHeaders,
            requestId,
            requestCancellation,
            onlyControls: true,
        });

        if (loaded) {
            return processNode<ResponseSuccessControls, ControlsOnlyWidget>(loaded);
        }

        return null;
    }

    async getConfig() {
        try {
            const {data} = await axiosInstance.get<SourcesConfig>(
                `${this.endpoint}/api/private/config`,
                this.prepareRequestConfig({}),
            );
            return data;
        } catch (error) {
            console.warn('CHARTS_CONFIG_FETCH_FAILED', error);
            return {};
        }
    }

    // called when status: 'success'
    pushStats(input: ChartKitLoadSuccess<ChartsData>, externalStats: Partial<ChartsStats> = {}) {
        // console.log('CHARTS_DATA_PROVIDER_PUSH_STATS', input);
        const stats = Object.assign(
            ChartsDataProvider.gatherStats({
                ...input.data,
                requestId: input.requestId,
            }),
            externalStats,
        );

        if (this.collectStatsTimerId) {
            window.clearTimeout(this.collectStatsTimerId);
        }

        this.collectStatsTimerId = window.setTimeout(
            this.collectStats.bind(this),
            STATS_COLLECT_TIMEOUT,
        );

        this.collectStatsBatchQueue.push(stats);
    }

    prepareRequestConfig(config: AxiosRequestConfig) {
        if (this.settings.requestDecorator) {
            const {headers, data} = this.settings.requestDecorator(
                Object.assign({headers: {}, data: {}}, pick(config, ['headers', 'data'])),
            );
            config.headers = headers;
            config.data = data;
        }
        return config;
    }

    async makeRequest(requestOptions: EntityRequestOptions & {url?: string}) {
        const stype = (requestOptions.data?.config as EntityConfig)?.meta?.stype;
        const isControlRequest =
            stype === ControlType.Dash ||
            requestOptions.data?.widgetType === DashTabItemControlSourceType.External;

        const isLowPriority =
            (!this.settings.loadPriority && isControlRequest) ||
            (this.settings.loadPriority === DashLoadPriority.Charts && isControlRequest) ||
            (this.settings.loadPriority === DashLoadPriority.Selectors && !isControlRequest);

        if (isLowPriority) {
            await Promise.resolve();
        }

        // correcting sending parameters as an empty array
        if (requestOptions?.data?.params) {
            const dataParams = requestOptions.data.params;

            Object.entries(dataParams).forEach(([paramKey, paramValue]) => {
                dataParams[paramKey] =
                    Array.isArray(paramValue) && paramValue.length < 1 ? [''] : paramValue;
            });
        }

        const headers = {...requestOptions.headers};

        if (isEmbeddedEntry()) {
            const getSecureEmbeddingToken = registry.chart.functions.get('getSecureEmbeddingToken');

            headers[DL_EMBED_TOKEN_HEADER] = getSecureEmbeddingToken();
        }

        return axiosInstance(
            this.prepareRequestConfig({
                url: `${this.requestEndpoint}${DL.API_PREFIX}/run`,
                method: 'post',
                ...requestOptions,
                headers,
            }),
        );
    }

    getGoAwayLink(
        {
            loadedData,
            propsData,
        }: {
            loadedData: (Widget & ChartsData) | {};
            propsData: ChartKitProps<ChartsProps, ChartsData>;
        },
        {extraParams = {}, urlPostfix = '', idPrefix = ''},
    ) {
        let url = urlPostfix;

        let id = propsData.id;
        if (!id && loadedData && 'entryId' in loadedData) {
            id = loadedData.entryId;
        }

        url += id ? idPrefix + id : propsData.source;

        const query = URI.makeQueryString({...propsData.params, ...extraParams});

        return url + query;
    }

    private getExtendedResponse<T extends ResponseSuccess | ResponseSuccessControls>(args: {
        responseData: T;
        headers: AxiosResponse<any, any>['headers'];
        includeLogs: boolean;
    }) {
        const {responseData, headers, includeLogs} = args;

        // TODO: return output when receiving onLoad
        if (includeLogs && 'logs_v2' in responseData) {
            ChartsDataProvider.printLogs((responseData as ResponseSuccessNodeBase).logs_v2);
        }

        if (headers[REQUEST_ID_HEADER]) {
            responseData.requestId = headers[REQUEST_ID_HEADER];
        }

        if (headers[TRACE_ID_HEADER]) {
            responseData.traceId = headers[TRACE_ID_HEADER];
        }

        return responseData;
    }

    private getLoadHeaders(requestId: string, contextHeaders?: DashChartRequestContext) {
        const headers: Record<string, string | null> = {
            ...(contextHeaders ?? {}),
            [REQUEST_ID_HEADER]: requestId,
        };
        if (Utils.isEnabledFeature(Feature.UseComponentHeader)) {
            headers[DL_COMPONENT_HEADER] = DlComponentHeader.UI;
        }

        return headers;
    }

    private processError(args: {
        error: any;
        requestId: string;
        includeLogs?: boolean;
        isEditMode?: boolean;
    }) {
        const {error, requestId, includeLogs, isEditMode = false} = args;

        if (axios.isCancel(error)) {
            return null;
        }

        const debug = {requestId};
        if (!error.response) {
            throw DatalensChartkitCustomError.wrap(error, {code: ERROR_CODE.NETWORK, debug});
        }

        const {
            response: {status, data},
        }: AxiosError<ResponseError> = error;

        if (includeLogs) {
            ChartsDataProvider.printLogs(data.logs_v2);
        }

        if (status === 489) {
            throw DatalensChartkitCustomError.wrap(error, {
                code: ERROR_CODE.UNAUTHORIZED,
                debug,
            });
        }

        const extra = {logs_v2: data.logs_v2, sources: data.sources, params: data.params};

        if (data.error) {
            throw DatalensChartkitCustomError.wrap(
                error,
                ChartsDataProvider.formatError(merge({debug, extra}, data.error), isEditMode),
            );
        }

        // error loading data in Wizard
        // @ts-ignore
        if (data.errorType === 'wizard_data_fetching_error') {
            throw DatalensChartkitCustomError.wrap(
                error,
                ChartsDataProvider.formatError(
                    {
                        code: CHARTS_ERROR_CODE.DATA_FETCHING_ERROR,
                        // @ts-ignore
                        details: {sources: data.sources},
                        debug,
                        extra,
                    },
                    isEditMode,
                ),
            );
        }

        throw DatalensChartkitCustomError.wrap(error, {debug, extra});
    }

    private async load({
        data,
        contextHeaders,
        requestId,
        requestCancellation,
        onlyControls = false,
    }: {
        data: ChartsProps;
        contextHeaders?: DashChartRequestContext;
        requestId: string;
        requestCancellation: CancelTokenSource;
        onlyControls?: boolean;
    }) {
        const {
            id,
            source,
            params,
            widgetType,
            widgetConfig,
            config: {type, data: configData, key, createdAt, sandbox_version} = {},
            workbookId,
        } = data;

        const isEditMode = Boolean(type && configData);
        const includeLogs = this.settings.includeLogs || isEditMode;

        const requestOptions = {
            data: {
                id,
                key,
                path: source,
                params,
                widgetType,
                widgetConfig,
                config: isEditMode
                    ? {
                          data: configData,
                          createdAt: createdAt,
                          meta: {stype: type, sandbox_version},
                      }
                    : undefined,
                responseOptions: {
                    // relevant for graph_wizard and metric_wizard
                    includeConfig: true,
                    includeLogs,
                },
                uiOnly: onlyControls || undefined,
                workbookId,
            },
            headers: this.getLoadHeaders(requestId, contextHeaders),
            'axios-retry': {
                retries: isEditMode || this.settings.noRetry ? 0 : 1,
            },
            cancelToken: requestCancellation['token'],
        };

        try {
            const result = await this.makeRequest(requestOptions);
            const responseData = this.getExtendedResponse({
                responseData: result.data,
                headers: result.headers,
                includeLogs,
            });

            if (this.settings.includeUnresolvedParams) {
                responseData.unresolvedParams = cloneDeep(params);
            }

            return responseData;
        } catch (error) {
            return this.processError({
                error,
                requestId,
                includeLogs,
                isEditMode,
            });
        }
    }

    private async collectStats() {
        try {
            const stats = this.collectStatsBatchQueue.splice(0, this.collectStatsBatchQueue.length);

            const requestCollectChartkitStats = registry.common.functions.get(
                'requestCollectChartkitStats',
            );
            await requestCollectChartkitStats(stats);
        } catch (error) {
            console.error('CHARTKIT_COLLECT_STATS_FAILED', error);
        }

        if (this.collectStatsBatchQueue.length) {
            this.collectStatsTimerId = window.setTimeout(
                this.collectStats.bind(this),
                STATS_COLLECT_TIMEOUT,
            );
        }
    }
}

export {ChartsDataProvider};

export * from './types';
