import type {IncomingHttpHeaders} from 'http';

import type {HighchartsComment} from '@gravity-ui/chartkit/highcharts';
import type {AxiosRequestConfig} from 'axios';
import type {
    ChartsInsightsItem,
    DashLoadPriority,
    DashTabItemControlSourceType,
    DashWidgetConfig,
    DatasetFieldCalcMode,
    DatasetFieldType,
    EntryPublicAuthor,
    StringParams,
    Timings,
    WorkbookId,
} from 'shared';
import type {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';

import type {WidgetType} from '../../../../../units/dash/modules/constants';
import type {
    Control,
    GraphWidget,
    MarkdownWidget,
    MarkupWidget,
    SingleControl,
    TableWidgetData,
    WithControls,
} from '../../../types';

export interface Settings {
    endpoint: string | string[];
    lang: 'ru' | 'en';
    includeLogs?: boolean;
    requestDecorator?: (
        config: Pick<AxiosRequestConfig, 'headers' | 'data'>,
    ) => Pick<AxiosRequestConfig, 'headers' | 'data'>;
    noJsonFn?: boolean;
    maxConcurrentRequests?: number | null;
    loadPriority?: DashLoadPriority;
    noRetry?: boolean;
    includeUnresolvedParams?: boolean;
}

export type SourcesConfig = Record<
    string,
    {
        dataEndpoint: string;
        description: {title: string};
    }
>;

interface ConfigNodeBase {
    type: string;
    data: {
        js: string;
        params: string;
        url: string;
        shared?: string;
        ui?: string;
    };
}

interface ConfigNodeGraph extends ConfigNodeBase {
    type: 'graph_node' | 'graph_wizard_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared' | 'ui' | 'graph' | 'statface_graph']: string};
}

interface ConfigNodeTable extends ConfigNodeBase {
    type: 'table_node' | 'table_wizard_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared' | 'ui' | 'table']: string};
}

interface ConfigNodeMetric extends ConfigNodeBase {
    type: 'metric_node' | 'metric_wizard_node';
    data: {[key in 'js' | 'params' | 'url' | 'statface_metric']: string};
}

interface ConfigNodeYMap extends ConfigNodeBase {
    type: 'ymap_node' | 'ymap_wizard_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared' | 'ymap']: string};
}

interface ConfigNodeMarkdown extends ConfigNodeBase {
    type: 'markdown_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared']: string};
}

interface ConfigNodeMarkup extends ConfigNodeBase {
    type: 'markup_node' | 'markup_wizard_node' | 'markup_ql_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared' | 'config']: string};
}

interface ConfigNodeControl extends ConfigNodeBase {
    type: 'control_node';
    data: {[key in 'js' | 'params' | 'url' | 'shared' | 'ui']: string};
}

interface ConfigNodeMap extends ConfigNodeBase {
    type: 'map_node';
    data: {[key in 'js' | 'params' | 'url' | 'statface_map']: string};
}

interface ConfigNodeText extends ConfigNodeBase {
    type: 'text_node';
    data: {[key in 'js' | 'params' | 'url' | 'statface_text']: string};
}

interface ConfigWizardBase {
    type: 'graph_wizard' | 'metric_wizard';
    // TODO@types
    data: object;
}

export type ConfigNode = (
    | ConfigNodeGraph
    | ConfigNodeTable
    | ConfigNodeMetric
    | ConfigNodeYMap
    | ConfigNodeMarkdown
    | ConfigNodeMarkup
    | ConfigNodeControl
    | ConfigNodeMap
    | ConfigNodeText
) & {
    // the key is passed for the case when it is editing in the Editor or Wizard.
    // At the same time, there is no entity request from US in /api/run (because everything you need is in EditMode),
    // therefore, information about the entity's key is not returned, but the key is needed for comments,
    // therefore, the key must be additionally passed from Editor and Wizard to ChartKit and then to /api/run,
    // to get it back in the response
    key: string;
    createdAt?: string;
    sandbox_version?: string;
};

export interface ChartsProps {
    id?: string;
    source?: string;
    params?: StringParams;
    initialParams?: ChartInitialParams;
    config?: ConfigNode;
    widgetType?: DashTabItemControlSourceType | WidgetType;
    widgetConfig?: {
        actionParams?: {
            enable?: boolean;
            fields?: string[];
        };
    };
    ignoreUsedParams?: boolean;
    workbookId?: WorkbookId;
    forceShowSafeChart?: boolean;
}

export interface ChartsData extends DashWidgetConfig {
    entryId: string;
    key: string;
    usedParams: StringParams;
    unresolvedParams?: StringParams;
    defaultParams?: StringParams;
    logs_v2?: string;
    // sources: {} when there are no sources
    sources: object | ResponseSourcesSuccess;
    // the old wizard doesn't have timings
    timings?: Timings;
    requestId: string;
    traceId: string;
    isNewWizard: boolean;
    isOldWizard: boolean;
    extra: {
        exportFilename?: string;
        dataExportForbidden?: boolean;
        datasets?: {
            id: string;
            fieldsList: DatasetFieldsListItem[];
            /** @deprecated because there is no type, only guid: title */
            fields: Record<string, string>;
        }[];
        /** @deprecated */
        datasetId?: string;
        /** @deprecated */
        datasetFields?: Record<string, string>;
    };
    publicAuthor?: EntryPublicAuthor;
    safeChartInfo?: string;
}

export type DatasetFieldsListItem = {
    title: string;
    guid: string;
    dataType: string;
    fieldType: DatasetFieldType;
    calc_mode?: DatasetFieldCalcMode;
};

export interface LogItem {
    type: 'string';
    value: string;
}

export type Logs = {
    [key in
        | 'Config'
        | 'Highcharts'
        | 'JavaScript'
        | 'Params'
        | 'UI'
        | 'Urls'
        | 'modules']?: LogItem[][];
};

export interface SourceBase {
    // TODO@types: stat | bi | ...
    sourceType: string;
    dataUrl: string;
    datasetId?: string;
    data?: object;
    uiUrl?: string;
    /** @deprecated use dataURL and uiUrl */
    url: string;
}

export interface SourceSuccess extends SourceBase {
    sourceId: string;
    responseHeaders: IncomingHttpHeaders;
    statusCode: number;
    latency: number;
    size: number;
    info?: object;
    hideInInspector?: boolean;
}

// TODO:
// interface SourceSuccessBi extends SourceSuccess {
//     sourceType: 'bi';
//     data: {
//         columns: string[];
//         order_by: object[];
//         where: object[];
//     };
// }

export type ResponseSourcesSuccess = Record<string, SourceSuccess>;

export interface SourceError extends SourceBase {
    message: string;
    body: object | string;
    errorName: string;
    status: number;
    code: string;
    details?: object;
}

export type ResponseSourcesError = Record<string, SourceError>;

// only for graph_* configs
interface Comments {
    comments: {
        comments: HighchartsComment[];
        // path - these are Statistics comments
        logs: {feed: string; error: string}[] | {path: string; error: string}[];
    };
}

// only for graph_* configs
interface PublicAuthor {
    publicAuthor?: EntryPublicAuthor;
}

// only for configs with the ui (Controls) tab
export interface UI {
    uiScheme: {controls: Control[]; lineBreaks?: 'wrap' | 'nowrap'} | Control[] | null;
}

interface SideMarkdown {
    extra: {sideMarkdown?: string | null};
}

interface ChartsInsights {
    extra: {chartsInsights?: ChartsInsightsItem[]};
}

// *_wizard_node configs
interface WizardNode {
    extra: {
        datasets: {
            id: string;
            fieldsList: {
                title: string;
                guid: string;
                // TODO@types: string | date | ...
                dataType: string;
                fieldType: DatasetFieldType;
            }[];
            /** @deprecated because there is no type, only guid: title */
            fields: Record<string, string>;
        }[];
        /** @deprecated */
        datasetId: string;
        /** @deprecated */
        datasetFields: Record<string, string>;
    };
}

interface ResponseSuccessWizardBase
    extends Pick<ResponseSuccessNodeBase, 'params' | 'usedParams' | 'sources'> {
    unresolvedParams?: StringParams;
    requestId: string;
    traceId: string;
    executionTime: number;
    data: object;
    _confStorageConfig: {
        // TODO@types
        data: object;
        key: string;
        type: ConfigWizardBase['type'];
        entryId: string;
    };
}

interface ResponseSuccessGraphWizard extends ResponseSuccessWizardBase, Comments {}
interface ResponseSuccessMetricWizard extends ResponseSuccessWizardBase {}

export interface ResponseSuccessNodeBase extends DashWidgetConfig {
    params: StringParams;
    usedParams: StringParams;
    unresolvedParams?: StringParams;
    defaultParams: StringParams;
    requestId: string;
    traceId: string;
    logs_v2?: string;
    key: string;
    id: string;
    sources: {fields?: {datasetId?: string}} | ResponseSourcesSuccess;
    extra: {
        exportFilename?: string;
        dataExportForbidden?: boolean;
    };
    timings: Timings;

    type: ConfigNode['type'];

    // configs are not used for *_node, so ConfigNode[*] types are not specified in the inheritors of the class
    _confStorageConfig: {
        // TODO@types
        data: ConfigNode['data'] | {secrets: unknown[]};
        meta: {stype: ConfigNode['type']};
        type: ConfigNode['type'];
        key: string;
        entryId: string;
    };
}

export interface ResponseSuccessControls
    extends ResponseSuccessNodeBase,
        UI,
        Partial<WithControls> {
    extra: ResponseSuccessNodeBase['extra'] & ResponseControlsExtra['extra'];
}

export type ResponseSuccessSingleControl = ResponseSuccessNodeBase &
    ResponseControlsExtra & {
        uiScheme: {controls: SingleControl[]; lineBreaks?: 'wrap' | 'nowrap'};
    };

export type ResponseControlsExtra = {
    extra: WizardNode['extra'];
};

interface ResponseSuccessNodeBaseWithData extends ResponseSuccessNodeBase {
    config: string;
    highchartsConfig: string;
    data: object;
}

export interface ResponseSuccessGraphNode
    extends ResponseSuccessNodeBaseWithData,
        Comments,
        PublicAuthor,
        UI {
    type: 'graph_node';
    extra: ResponseSuccessNodeBase['extra'] & ChartsInsights['extra'] & SideMarkdown['extra'];
    data: GraphWidget['data'];
    // example of the _confStorageConfig refinement
    _confStorageConfig: {
        data: ConfigNodeGraph['data'] | {secrets: unknown[]};
        meta: {stype: 'graph_node'};
        type: 'graph_node';
        key: string;
        entryId: string;
    };
}

export interface ResponseSuccessGraphWizardNode
    extends ResponseSuccessNodeBaseWithData,
        Comments,
        PublicAuthor,
        WizardNode {
    type: 'graph_wizard_node';
    extra: ResponseSuccessNodeBase['extra'] & WizardNode['extra'];
    data: ResponseSuccessGraphNode['data'];
}

export interface ResponseSuccessTableNode extends ResponseSuccessNodeBaseWithData, UI {
    type: 'table_node';
    data: TableWidgetData['data'];
}

interface ResponseSuccessTableWizardNode extends ResponseSuccessNodeBaseWithData, WizardNode {
    type: 'table_wizard_node';
    extra: ResponseSuccessNodeBase['extra'] & WizardNode['extra'];
    data: ResponseSuccessTableNode['data'];
}

export interface ResponseSuccessControlNode extends ResponseSuccessNodeBaseWithData, UI {
    type: 'control_node';
}

export interface ResponseSuccessMarkdownNode extends ResponseSuccessNodeBaseWithData {
    type: 'markdown_node';
    data: MarkdownWidget['data'];
}

export interface ResponseSuccessMarkupNode extends ResponseSuccessNodeBaseWithData {
    type: 'markup_node';
    data: MarkupWidget;
}

// TODO@types: other chart types

export type ResponseSuccessNode =
    | ResponseSuccessGraphNode
    | ResponseSuccessGraphWizardNode
    | ResponseSuccessTableNode
    | ResponseSuccessTableWizardNode
    | ResponseSuccessControlNode
    | ResponseSuccessMarkdownNode;

type ResponseSuccessWizard = ResponseSuccessGraphWizard | ResponseSuccessMetricWizard;

export type ResponseSuccess = ResponseSuccessNode | ResponseSuccessWizard;

interface ResponseErrorNodeBase {
    error: {
        code: string;
        details?: object;
        debug?: object;
    };
    logs_v2?: string;
    sources?: ResponseSourcesSuccess;
    params?: StringParams;
}

interface ResponseErrorNodeLoading extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.CONFIG_LOADING_ERROR';
        details: {code: 403 | 404};
        debug: {message: string};
    };
}

interface ResponseErrorNodeRuntime extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.RUNTIME_ERROR';
        details: {
            stackTrace: string;
            tabName: string;
        };
    };
}

interface ResponseErrorNodeRuntimeTimeout extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.RUNTIME_TIMEOUT';
    };
}

// Shared tab
interface ResponseErrorNodeRuntimeShared extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.RUNTIME_ERROR';
        details: {description: string};
        debug: {message: string};
    };
}

interface ResponseErrorNodeDeps extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.DEPS_RESOLVE_ERROR';
        details: {stackTrace: string};
        debug: {message: string};
    };
}

interface ResponseErrorNodeFetching extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.DATA_FETCHING_ERROR';
        debug: object;
        details: {sources: ResponseSourcesError};
    };
}

interface ResponseErrorNodeSecretsAccess extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.SECRETS_ACCESS';
        details: {stackTrace: string};
        message: string;
    };
}

interface ResponseErrorNodeFetching extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.DATA_FETCHING_ERROR';
        debug: object;
        details: {sources: ResponseSourcesError};
    };
}

interface ResponseErrorRowsOversize extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.ROWS_NUMBER_OVERSIZE';
        // TODO@types: debug, details
    };
}

interface ResponseErrorTableOverszie extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.TABLE_OVERSIZE';
        details:
            | {
                  type: 'columns';
                  columnsCount: number;
                  columnsLimit: number;
              }
            | {
                  type: 'cells';
                  cellsCount: number;
                  cellsLimit: number;
              };
    };
}

interface ResponseErrorSegmentsOversize extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.SEGMENTS_OVERSIZE';
        details: {
            segmentsCount: number;
            segmentsLimit: number;
        };
    };
}

interface ResponseErrorUnsupportedDataType extends ResponseErrorNodeBase {
    error: {
        code: 'ERR.CHARTS.UNSUPPORTED_DATA_TYPE';
        details: {
            field: string;
        };
    };
}

type ResponseErrorNode =
    | ResponseErrorNodeRuntime
    | ResponseErrorNodeRuntimeTimeout
    | ResponseErrorNodeRuntimeShared
    | ResponseErrorNodeLoading
    | ResponseErrorNodeDeps
    | ResponseErrorNodeFetching
    | ResponseErrorRowsOversize
    | ResponseErrorTableOverszie
    | ResponseErrorSegmentsOversize
    | ResponseErrorNodeSecretsAccess
    | ResponseErrorUnsupportedDataType;

// TODO@types wizard

export type ResponseError = ResponseErrorNode;
