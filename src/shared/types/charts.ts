import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {ChartsInsight, IntervalPart} from '../modules';

import {StringParams} from './common';

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

    setErrorTransform(errorTransformer: (error: unknown) => unknown): unknown;
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
    };
};
