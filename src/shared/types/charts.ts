import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {WRAPPED_HTML_KEY} from '../constants';
import type {WidgetSize} from '../constants/charts';
import type {WRAPPED_FN_KEY} from '../constants/ui-sandbox';
import type {ChartsInsight, IntervalPart} from '../modules';

import type {StringParams} from './common';
import type {UISandboxWrappedFunction} from './ui-sandbox';

const REQUIRED_THEME_VALUES = ['dark', 'light'] as const;
const OPTIONAL_THEME_VALUES = ['dark-hc', 'light-hc'] as const;
type RequiredThemes = Record<(typeof REQUIRED_THEME_VALUES)[number], Record<string, string>>;
type OptionalThemes = Partial<
    Record<(typeof OPTIONAL_THEME_VALUES)[number], Record<string, string>>
>;

export type ChartKitHtmlItem = {
    tag: string;
    style?: Record<string, string | number>;
    attributes?: Record<string, string | number>;
    content?: ChartKitHtmlItem | ChartKitHtmlItem[] | string;
    theme?: RequiredThemes & OptionalThemes;
};

export type WrappedHTML = {[WRAPPED_HTML_KEY]: ChartKitHtmlItem | ChartKitHtmlItem[] | string};

export interface IChartEditor {
    /**
     * Return current user login
     */
    getUserLogin(): string;

    /**
     * Return current user lang
     */
    getUserLang(): string;

    /**
     * Return current user lang
     */
    getLang(): string;

    /**
     * Return translation for key with current user lang
     */
    getTranslation(
        keyset: string,
        key: string,
        params?: Record<string, string | string[] | number>,
    ): string;

    /**
     * Return added yav secrets {key: value, ...}
     */
    getSecrets(): {[key: string]: string};

    /**
     * Return data from tab 'Shared'
     */
    getSharedData(): {[key: string]: object};

    /**
     * Return dash widget config
     */
    getWidgetConfig(): DashWidgetConfig['widgetConfig'];

    /**
     * Return data from tab 'Params'
     */
    getParams(): StringParams;

    /**
     * Return actionParams data
     */
    getActionParams(): StringParams;

    /**
     * Return data from tab 'Params'
     */
    getParam(paramName: string): string | string[];
    /**
     * Return current page number (only for tabs 'Urls' & 'JavaScript')
     */
    getCurrentPage(): number;

    /**
     * Return current clicked column id and sort order (only for tab 'Urls')
     */
    getSortParams(): SortParams;

    /**
     * Return <ISO date>\n
     * \t'__relative_-7d' return 7 day before\n
     * years - y; month - M; weeks - w; days - d; hours - h; minutes - m; seconds - s; milliseconds - ms;
     */
    resolveRelative(relativeStr: string, intervalPart?: IntervalPart): string | null;

    /**
     * Return {from: <ISO date>, to: <ISO date>}\n
     * \t'__interval___relative_-7d___relative_+30min' return {from: <7 day before>, to: <now + 30 minutes>}\n
     * \t'__interval_2018-10-10___relative_-2w' return {from: '2018-10-10 00:00:00', to: <2 weeks before>}\n
     * years - y; month - M; weeks - w; days - d; hours - h; minutes - m; seconds - s; milliseconds - ms;
     */
    resolveInterval(intervalStr: string): {from: string; to: string} | null;

    resolveOperation(input: string): any;

    /**
     * Update ChartKit config (only for tab 'JavaScript')
     */
    updateConfig(updatedFragment: object): void;

    setChartsInsights(input: ChartsInsight[]): void;

    getLoadedData(): {
        [key: string]: any;
    };

    getLoadedDataStats(): {
        [key: string]: any;
    };

    setError({code, details}: {code: string; details?: any}): void;
    _setError({code, details}: {code: string; details?: any}): void;

    updateHighchartsConfig(config: {[key: string]: any}): void;

    setDataSourceInfo(key: string, value: object): void;

    setExtra(key: string, value: any): void;

    updateParams(params: object): void;

    updateActionParams(params: object): void;

    updateLibraryConfig(config: Record<string, any>): void;

    setSideHtml(html: string): void;

    setSideMarkdown(markdown: string): void;

    setExportFilename(filename: string): void;

    wrapFn(value: any): {[WRAPPED_FN_KEY]: UISandboxWrappedFunction};

    generateHtml(value: ChartKitHtmlItem): WrappedHTML;

    attachHandler(
        handlerConfig: Record<string, unknown>,
    ): Record<string, unknown> & {__chartkitHandler: true};
    attachFormatter(
        formatterConfig: Record<string, unknown>,
    ): Record<string, unknown> & {__chartkitFormatter: true};
}

export interface Link {
    id: string;
    fields: Record<string, LinkField>;
}

export interface LinkField {
    field: {
        title: string;
        guid: string;
    };
    dataset: {
        id: string;
        realName: string;
    };
}

export interface PayloadFilter {
    column: string;
    operation: string;
    values: string[];
    isDrillDown?: boolean;
}

export interface FilterBody {
    operation: {
        code: string;
    };
    value: string | string[];
}

export interface UrlRequest {
    url: string;
    data?: Record<string, unknown>;
    cache?: number;
    method: 'GET' | 'POST';
    hideInInspector?: boolean;
}

export interface SortParams {
    columnId?: string;
    order?: number;
    meta?: Record<string, any>;
}

export interface ExtendedSeriesLineOptions extends Highcharts.SeriesLineOptions {
    title: string;
    shapeValue?: string;
    lineColor?: Highcharts.GradientColorObject;
}

export type ExportingColumnOptions = {
    title?: string;
    dataType?: string;
    format?: string;
};

/** Additional settings for exporting the chart to xlsx/csv.
 * Used in exporting.csv.columnHeaderFormatter
 */
type CustomExportingCsvOptions = {
    categoryHeader?: ExportingColumnOptions;

    /** the key is the key from exporting.csv.columnHeaderFormatter (from series.<type>.keys)*/
    columnHeaderMap?: Record<string, ExportingColumnOptions>;
};

export interface ExtendedExportingCsvOptions
    extends Omit<Highcharts.ExportingCsvOptions, 'columnHeaderFormatter'> {
    custom?: CustomExportingCsvOptions;

    columnHeaderFormatter?: string;
}

export type WidgetSizeType = (typeof WidgetSize)[keyof typeof WidgetSize];

/**
 * Config of dash widget item, used for settings of actionParams (enabled filtering charts in section)
 * @enable boolean - value of filtering chart widget settings
 * @fields string[] - list of dataset fields (or chartEditor params) which is used for actionParams
 * (will be set in dash relation dialog later), if undefined - means that using full fileds list
 */
export type DashWidgetConfig = {
    widgetConfig?: {
        actionParams?: {
            enable?: boolean;
            fields?: string[];
        };
        enableExport?: boolean;
        size?: WidgetSizeType;
    };
};

export interface Timings {
    configResolving: number | null;
    dataFetching: number | null;
    jsExecution: number | null;
}

export interface ChartsStats extends Timings {
    url: string;
    requestId: string;
    groupId: string | null;
    scope: 'dash' | 'preview' | 'snapter' | null;
    entryId: string;
    query: string;
    type: string;
    // type: 'graph' | 'table'
    widgetRendering: number | null;
    yandexMapAPIWaiting?: number | null;
    sourcesCount: number;
    // type: 'graph'
    graphType: string | null;
    mixedGraphType: 0 | 1 | null;
    pointsCount: number | null;
    seriesCount: number | null;
    // type: 'table'
    columnsCount: number | null;
    rowsCount: number | null;
}
