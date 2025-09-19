import type {AppContext} from '@gravity-ui/nodekit';

import type {
    ApiV2DataExportField,
    ChartsInsight,
    DashWidgetConfig,
    EntryPublicAuthor,
    IChartEditor,
    StringParams,
} from '../../../../../shared';

import type {
    CommentsFetcherFetchResult,
    CommentsFetcherPrepareCommentsParams,
} from './comments-fetcher';
import type {Console, LogItem} from './console';
import type {DataFetcherResult} from './data-fetcher';
import type {ProcessorHooks} from './hooks';

export type UiTabExportsControl = {
    type: string;
    param: string;
    content?: unknown[];
    updateOnChange?: boolean;
    postUpdateOnChange?: boolean;
    updateControlsOnChange?: boolean;
    disabled?: boolean;
};

export type UiTabExports =
    | {
          lineBreaks?: 'wrap';
          controls: UiTabExportsControl[];
      }
    | UiTabExportsControl[];

export type ProcessorErrorResponse = {
    error: {
        code?: string;
        debug?: {
            message?: string;
            [x: string]: any;
        };
        message?: string;
        details?: Record<string, any>;
        statusCode?: number;
    };
    logs_v2?: string;
    sources?: Record<string, DataFetcherResult>;
};

export type ProcessorSuccessResponse = {
    sources: Record<string, DataFetcherResult>;
    uiScheme: UiTabExports | null;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    /**
     * defaultParams is object from Params tab
     * needed for reset filters logic
     */
    defaultParams: Record<string, string | string[]>;
    usedParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    extra: {
        chartsInsights?: ChartsInsight[];
        sideMarkdown?: string;
        exportFilename?: string;
        colors?: string[];
    };
    dataExport?: Record<string, ApiV2DataExportField | undefined>;
    timings: {};
    data?: {
        markdown?: string;
        html?: string;
        meta?: object;
        original_markdown?: string;
    };
    logs_v2?: string;
    config?: string;
    highchartsConfig?: string;
    comments?: CommentsFetcherFetchResult;
    publicAuthor?: EntryPublicAuthor;
    id?: string;
    revId?: string;
    _confStorageConfig?: object;
    key?: string;
    type?: string;
};

export type ProcessorFiles =
    | 'Shared'
    | 'Params'
    | 'Sources'
    | 'Highcharts'
    | 'Config'
    | 'Prepare'
    | 'Controls';
export type ProcessorLogs = {modules: LogItem[][]} & Partial<
    Record<ProcessorFiles | 'failed', LogItem[][]>
>;

export type UserConfig = {
    overlayControls?: Record<string, string>;
    notOverlayControls?: boolean;
    comments?: CommentsFetcherPrepareCommentsParams['config'];
    enableJsAndHtml?: boolean;
};

export type NativeModule = {
    buildSources: () => {};
    buildGraph: () => {};
    buildUI?: () => {};
    buildChartsConfig?: () => {};
    buildHighchartsConfig?: () => {};
    setConsole?: (console: Console) => void;
};

export type RuntimeMetadata = {
    error?: unknown;
    userParamsOverride?: StringParams;
    userConfigOverride?: unknown;
    libraryConfigOverride?: unknown;
    userActionParamsOverride?: StringParams;
    exportFilename?: string;
    dataSourcesInfos?: unknown;
    sideMarkdown?: string;
    extra?: {
        chartsInsights?: ChartsInsight[];
        sideMarkdown?: string;
        exportFilename?: string;
    };
    chartsInsights?: ChartsInsight[];
};

export type ChartApiContext = {
    ChartEditor: IChartEditor;
    __runtimeMetadata: RuntimeMetadata;
};

export type ChartBuilderResult = {
    exports: unknown;
    executionTiming: [number, number];
    runtimeMetadata: RuntimeMetadata;
    name: string;
    logs?: LogItem[][];
};

export type ChartBuilder = {
    type?: 'CHART_EDITOR' | 'WIZARD' | 'CONTROL';
    buildShared: () => Promise<void>;
    buildModules: (args: {
        subrequestHeaders: Record<string, string>;
        ctx: AppContext;
        onModuleBuild: (args: {executionTiming: [number, number]; filename: string}) => void;
    }) => Promise<Record<string, ChartBuilderResult>>;
    buildParams: (args: {
        params: StringParams;
        usedParams: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult>;
    buildUrls: (args: {
        params: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult>;
    buildChartLibraryConfig: (args: {
        data?: unknown;
        params: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult | null>;
    buildChartConfig: (args: {
        data?: unknown;
        params: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult>;
    buildChart: (args: {
        data: unknown;
        sources?: Record<string, DataFetcherResult>;
        params: StringParams;
        usedParams: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult>;
    buildUI: (args: {
        data?: unknown;
        params: StringParams;
        usedParams: StringParams;
        actionParams: StringParams;
        hooks: ProcessorHooks;
    }) => Promise<ChartBuilderResult>;
    dispose: () => void;
};
