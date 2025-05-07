import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';

import type {
    ChartkitHandlers,
    DashWidgetConfig,
    GraphTooltipLine,
    GraphWidgetEventScope,
    ServerChartsConfig,
    ServerCommonSharedExtraSettings,
    StringParams,
    TableWidgetEventScope,
    WidgetEvent,
} from '../../../../../../shared';

import type {CommentsMatchType} from './constants';

interface Comments {
    feeds?: Feed[];
    matchedParams?: string[];
    matchType?: CommentsMatchType;
}

type Feed = {
    feed: string;
    matchedParams?: string[];
    matchType?: CommentsMatchType;
};

type BaseConfig = {
    drillDown?: {
        breadcrumbs: string[];
        level: number;
    };
    enableJsAndHtml?: boolean;
};

type GraphConfig = BaseConfig &
    Pick<
        HighchartsWidgetData['config'],
        | 'title'
        | 'hideHolidaysBands'
        | 'linesLimit'
        | 'tooltip'
        | 'withoutLineLimit'
        | 'enableSum'
        | 'showPercentInTooltip'
    > & {
        manageTooltipConfig?:
            | ChartkitHandlers.WizardManageTooltipConfig
            | ((config: {lines: GraphTooltipLine[]}) => void);
        comments?: Comments;
        navigatorSettings?: ServerCommonSharedExtraSettings['navigatorSettings'];
        calcClosestPointManually?: boolean;
        enableGPTInsights?: ServerCommonSharedExtraSettings['enableGPTInsights'];
        events?: {
            click?: WidgetEvent<GraphWidgetEventScope> | WidgetEvent<GraphWidgetEventScope>[];
        };
        preventDefaultForPointClick?: boolean;
    };

export type TableConfig = BaseConfig & {
    settings: {
        externalSort?: boolean;
        preserveWhiteSpace?: boolean;
    };
    paginator?: {
        enabled: boolean;
        limit?: number;
    };
    events?: {
        click?: WidgetEvent<TableWidgetEventScope> | WidgetEvent<TableWidgetEventScope>[];
    };
};

export type MetricConfig = BaseConfig & {
    metricVersion?: number;
};

export type Config = GraphConfig | TableConfig | MetricConfig;

export type ConfigWithActionParams = TableConfig | GraphConfig;

export type BuildChartConfigArgs = {
    shared: ServerChartsConfig;
    params: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
};
