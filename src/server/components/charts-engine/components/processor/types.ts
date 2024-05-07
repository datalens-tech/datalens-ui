import {Request} from '@gravity-ui/expresskit';
import {AppContext} from '@gravity-ui/nodekit';

import type {
    ChartsInsight,
    DashWidgetConfig,
    EntryPublicAuthor,
    IChartEditor,
    StringParams,
} from '../../../../../shared';

import {CommentsFetcherFetchResult, CommentsFetcherPrepareCommentsParams} from './comments-fetcher';
import {Console} from './console';
import {DataFetcherResult} from './data-fetcher';

export type UiTabExportsControl = {
    type: string;
    param: string;
    content?: unknown[];
    updateOnChange?: boolean;
    postUpdateOnChange?: boolean;
    updateControlsOnChange?: boolean;
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
    };
    timings: {};
    data?: {
        markdown?: string;
        html?: string;
    };
    logs_v2?: string;
    config?: string;
    highchartsConfig?: string;
    comments?: CommentsFetcherFetchResult;
    publicAuthor?: EntryPublicAuthor;
};

export type ProcessorFiles =
    | 'Shared'
    | 'Params'
    | 'Urls'
    | 'Highcharts'
    | 'Config'
    | 'JavaScript'
    | 'UI';
export type ProcessorLogs = {modules: {type: string; value: string | number}[][]} & Partial<
    Record<ProcessorFiles | 'failed', {type: string; value: string | number}[][]>
>;

export type UserConfig = {
    overlayControls?: Record<string, string>;
    notOverlayControls?: boolean;
    comments?: CommentsFetcherPrepareCommentsParams['config'];
};

export type NativeModule = {
    buildSources: () => {};
    buildGraph: () => {};
    buildUI?: () => {};
    buildChartsConfig?: () => {};
    buildHighchartsConfig?: () => {};
    setConsole?: (console: Console) => void;
};

export type NativeModulesType = 'BASE_NATIVE_MODULES';

export type RuntimeMetadata = {
    error?: unknown;
    userParamsOverride?: StringParams;
    userConfigOverride?: unknown;
    libraryConfigOverride?: unknown;
    userActionParamsOverride?: StringParams;
    exportFilename?: string;
    dataSourcesInfos?: unknown;
    sideMarkdown?: string;
    extra: {
        chartsInsights?: ChartsInsight[];
        sideMarkdown?: string;
        exportFilename?: string;
    };
    chartsInsights?: ChartsInsight[];
    errorTransformer: <T>(error: T) => T;
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
    logs?: {type: string; value: string | number}[][];
};

export type ChartBuilder = {
    buildShared: () => Promise<void>;
    buildModules: (args: {
        subrequestHeaders: Record<string, string>;
        req: Request;
        ctx: AppContext;
        onModuleBuild: (args: {executionTiming: [number, number]; filename: string}) => void;
    }) => Promise<Record<string, ChartBuilderResult>>;
    buildParams: () => Promise<ChartBuilderResult>;
    buildUrls: () => Promise<ChartBuilderResult>;
    buildChartLibraryConfig: (data?: unknown) => Promise<ChartBuilderResult | null>;
    buildChartConfig: (data?: unknown) => Promise<ChartBuilderResult>;
    buildChart: (
        data: unknown,
        sources?: Record<string, DataFetcherResult>,
    ) => Promise<ChartBuilderResult>;
    buildUI: (data?: unknown) => Promise<ChartBuilderResult>;
};
