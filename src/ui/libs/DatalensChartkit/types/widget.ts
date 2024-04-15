import type {ChartKitType, ChartKitProps as OpenSourceChartKitProps} from '@gravity-ui/chartkit';
import type {
    Highcharts,
    HighchartsComment,
    HighchartsWidgetData,
} from '@gravity-ui/chartkit/highcharts';
import {Yagr, YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import type {ItemStateAndParamsChangeOptions} from '@gravity-ui/dashkit';
import DataTable, {DataTableProps} from '@gravity-ui/react-data-table';
import {Optional, Required} from 'utility-types';

import {
    ChartkitHandlers,
    ChartsInsightsItem,
    GraphTooltipLine,
    GraphWidgetEventScope,
    MarkupItem,
    StringParams,
    TableCell,
    TableHead,
    TableRow,
    TableTitle,
    TableWidgetEventScope,
    WidgetEvent,
} from '../../../../shared';
import {ChartsData} from '../modules/data-provider/charts';

import {CombinedError} from './common';
import {Control} from './control';

export type WithControls = {
    controls: {controls: Control[]; lineBreaks?: 'wrap' | 'nowrap'} | null;
};

enum EvaluationStatusCode {
    Ok = 'OK',
    Warn = 'WARN',
    Alarm = 'ALARM',
    Error = 'ERROR',
    NoData = 'NO_DATA',
    Unrecognized = 'UNRECOGNIZED',
}

export type Alert = {
    id: string;
    projectId: string;
    parentId: string;
    annotations: Record<string, string>;
    labels: Record<string, string>;
    notificationStats: Record<string, string>;
    evaluationStatusCode: EvaluationStatusCode;
    link: string;
};

export type AlertData = {
    type: 'single' | 'multi';
    alerts: Alert[];
};

export type LoadedWidget = Highcharts.Chart | Yagr | ChartKitDataTable | AlertData | null;

export type DrillDownConfig = {
    breadcrumbs: string[];
};

export type ChartsInsightsLocators = Record<string, string>;

export type ChartsInsightsData = {
    items: ChartsInsightsItem[];
    messagesByLocator: Record<string, string>;
    locators: ChartsInsightsLocators;
};

export interface WidgetBase {
    type: string;
    entryId?: string;
    data?: object;
    params: StringParams;
    initialParams?: StringParams;
    config?: {
        drillDown?: DrillDownConfig;
        comments?: {
            matchedParams: Array<any>;
            feeds: {
                configFeeds: Array<{feed: string}>;
            };
            path: string;
            matchType: string;
        };
        /** Flag responsible for enabling potentially dangerous functionality:
         * - disabling escaping of the tooltip header in the tooltipHeader value
         */
        unsafe?: boolean;
    };
    libraryConfig?: Highcharts.Options | Record<string, any>;
    requestId?: string;
    traceId?: string;
    chartsInsightsData?: ChartsInsightsData;
    sideMarkdown?: string;
}

type WidgetBaseWithData = Required<WidgetBase, 'data'>;

export type ControlsOnlyWidget = Optional<WidgetBase, 'data'> & WithControls;

// Additional properties on the js tab for series that are not in highcharts
export type GraphWidgetSeriesOptions = Highcharts.SeriesOptionsType & {
    title?: string;
    sname?: string;
    fname?: string;
};

export type GraphWidget = WidgetBaseWithData &
    WithControls & {
        type: 'graph';
        data:
            | GraphWidgetSeriesOptions[]
            | {
                  graphs: GraphWidgetSeriesOptions[];
                  categories_ms: number[];
              }
            | {
                  graphs: GraphWidgetSeriesOptions[];
                  categories: string[];
              }
            | {
                  graphs: GraphWidgetSeriesOptions[];
              };
        config: {
            hideComments?: boolean;
            disableExternalComments?: boolean;
            hideHolidays?: boolean;
            normalizeDiv?: boolean;
            normalizeSub?: boolean;
            withoutLineLimit?: boolean;
            precision?: number;
            title?: string;
            subtitle?: string;
            highstock?: {
                override_range_min: number;
                override_range_max: number;
            };
            drillDown?: DrillDownConfig;
            manageTooltipConfig?:
                | ChartkitHandlers.WizardManageTooltipConfig
                | ((config: {lines: GraphTooltipLine[]}) => void);
            enableGPTInsights?: boolean;
            tooltip?: HighchartsWidgetData['config']['tooltip'];
            events?: {
                click?: WidgetEvent<GraphWidgetEventScope> | WidgetEvent<GraphWidgetEventScope>[];
            };
        };
        libraryConfig: Highcharts.Options;
        comments?: HighchartsComment[];
        sideMarkdown?: string;
        publicAuthor?: {text?: string; link?: string};
    };

export type TimeseriesWidget = WidgetBaseWithData &
    YagrWidgetData & {
        type: 'timeseries';
    };

type MapWidget = WidgetBase & {
    type: 'map';
};
type TextWidget = WidgetBase & {
    type: 'text';
};
type AlertWidget = WidgetBase & {
    type: 'alert';
};

type D3Widget = WidgetBase & {type: 'd3'};

type WidgetComponentProps =
    | GraphWidget
    | TableWidget
    | MarkdownWidget
    | MetricWidget
    | Metric2Widget
    | YMapWidget
    | TimeseriesWidget
    | MapWidget
    | TextWidget
    | AlertWidget;

export type WidgetProps = {
    id: string;
    data: WidgetComponentProps;
    nonBodyScroll?: boolean;
    splitTooltip?: boolean;
    isMobile?: boolean;
    lang: 'ru' | 'en';
    onLoad?: (data?: OnLoadData) => void;
    onError?: ({error}: {error: CombinedError | unknown}) => void;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
} & Pick<OpenSourceChartKitProps<ChartKitType>, 'onRender' | 'onChartLoad'>;

export type ChartKitProps = {
    loadedData: WidgetComponentProps;
    nonBodyScroll?: boolean;
    splitTooltip?: boolean;
    showLoader?: boolean;
    loaderCompact?: boolean;
    loaderVeil?: boolean;
    onLoad?: (data?: OnLoadData) => void;
    onError?: ({error}: {error: CombinedError | unknown}) => void;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
    ) => void;
};

export type DataTableData = Record<string, TableCell>;

export type ChartKitDataTable = DataTable<DataTableData>;

export type TableWidget = WidgetBaseWithData &
    WithControls & {
        type: 'table';
        // data: {} when there is no data
        data: {
            head?: TableHead[];
            rows?: TableRow[];
            footer?: TableRow[];
        };
        config?: {
            title?: string | TableTitle;
            sort?: string;
            order?: 'asc' | 'desc';
            settings?: DataTableProps<DataTableData>['settings'];
            paginator?: {
                enabled: boolean;
                limit?: number;
            };
            drillDown?: DrillDownConfig;
            events?: {
                click?: WidgetEvent<TableWidgetEventScope> | WidgetEvent<TableWidgetEventScope>[];
            };
        };
        unresolvedParams?: StringParams;
    };

export interface ControlWidget extends WidgetBaseWithData, WithControls {
    type: 'control';
}

export type MarkdownWidget = WidgetBaseWithData & {
    type: 'markdown';
    data: {
        html: string;
    };
};

type Metric = {
    title: string;
    content: {
        current: {
            value: number;
            formatted: boolean;
        };
        last?: {
            value: number;
            formatted: boolean;
        };
        diff?: object;
        diffPercent?: object;
    };
    chart?: GraphWidget['data'];
    colorize?: 'more-green' | 'less-green';
};

type MetricWidget = WidgetBaseWithData & {
    type: 'metric';
    data: Metric[];
    config?: {
        metricVersion?: 2;
        drillDown?: DrillDownConfig;
    };
};

export interface Metric2Widget extends WidgetBaseWithData {
    type: 'metric2';
    data: Metric[];
    config?: {
        metricVersion: 2;
        drillDown?: DrillDownConfig;
    };
}

export interface YMapWidget extends WidgetBaseWithData {
    type: 'ymap';
}

export type MarkupWidget = WidgetBaseWithData & {
    type: 'markup';
    data: MarkupItem;
};

export type Widget =
    | GraphWidget
    | D3Widget
    | TableWidget
    | ControlWidget
    | MapWidget
    | MarkdownWidget
    | MetricWidget
    | Metric2Widget
    | YMapWidget
    | TextWidget
    | TimeseriesWidget
    | MarkupWidget;

type ParamsChangedOnChange = {
    type: 'PARAMS_CHANGED';
    data: {
        params: StringParams;
    };
    options?: ItemStateAndParamsChangeOptions;
};

type YMapGeoObjectVisibilityChangedOnChange = {
    type: 'YMAP_GEOOBJECT_VISIBILITY_CHANGED';
    data: {
        geoObjectId: string;
        value: boolean;
    };
};

export type OnLoadData = {
    widget?: LoadedWidget;
    widgetRendering?: number | null;
    yandexMapAPIWaiting?: number | null;
};

export type OnChangeData = ParamsChangedOnChange | YMapGeoObjectVisibilityChangedOnChange;

export type LoadedWidgetData<TProviderData = unknown> = (Widget & TProviderData) | null;

export type WidgetData = (Widget & ChartsData) | null;
