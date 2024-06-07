import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';

import type {
    DashWidgetConfig,
    FeatureConfig,
    GraphTooltipLine,
    GraphWidgetEventScope,
    ServerChartsConfig,
    ServerCommonSharedExtraSettings,
    StringParams,
    TableWidgetEventScope,
    WidgetEvent,
} from '../../../../../shared';
import {
    ChartkitHandlers,
    DEFAULT_CHART_LINES_LIMIT,
    Feature,
    PlaceholderId,
    WizardVisualizationId,
    getIsNavigatorEnabled,
    getServerFeatures,
    isTreeField,
} from '../../../../../shared';
import {registry} from '../../../../registry';

import {mapChartsConfigToServerConfig} from './utils/config-helpers';
import {getAllPlaceholderItems, isNeedToCalcClosestPointManually, log} from './utils/misc-helpers';

enum CommentsMatchType {
    Full = 'full',
    Contains = 'contains',
    Intersection = 'intersection',
}

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
    };

type TableConfig = BaseConfig & {
    settings: {
        highlightRows?: boolean;
        externalSort?: boolean;
    };
    paginator?: {
        enabled: boolean;
        limit?: number;
    };
    events?: {
        click?: WidgetEvent<TableWidgetEventScope> | WidgetEvent<TableWidgetEventScope>[];
    };
};

type MetricConfig = BaseConfig & {
    metricVersion?: number;
};

export type Config = GraphConfig | TableConfig | MetricConfig;

type ConfigWithActionParams = TableConfig | GraphConfig;

function getActionParamsEvents(
    visualizationId?: WizardVisualizationId,
): ConfigWithActionParams['events'] {
    switch (visualizationId) {
        case WizardVisualizationId.FlatTable: {
            return {
                click: [{handler: {type: 'setActionParams'}, scope: 'row'}],
            };
        }
        case WizardVisualizationId.PivotTable: {
            return {
                click: [{handler: {type: 'setActionParams'}, scope: 'cell'}],
            };
        }
        case WizardVisualizationId.Line:
        case WizardVisualizationId.LineD3:
        case WizardVisualizationId.Area:
        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p:
        case WizardVisualizationId.BarXD3:
        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p:
        case WizardVisualizationId.Scatter:
        case WizardVisualizationId.ScatterD3:
        case WizardVisualizationId.Pie:
        case WizardVisualizationId.PieD3:
        case WizardVisualizationId.Donut:
        case WizardVisualizationId.DonutD3:
        case WizardVisualizationId.CombinedChart: {
            return {
                click: [{handler: {type: 'setActionParams'}, scope: 'point'}],
            };
        }
    }

    return undefined;
}

function canUseActionParams(shared: ServerChartsConfig) {
    const hasDrillDownEvents = Boolean(shared.sharedData?.drillDownData);
    const tableVisualization = shared.visualization.id === WizardVisualizationId.FlatTable;
    const hasTreeFields =
        tableVisualization &&
        shared.visualization.placeholders.find(
            (p) => p.id === PlaceholderId.FlatTableColumns && p.items.some(isTreeField),
        );

    return !hasDrillDownEvents && !hasTreeFields;
}

type BuildChartConfigArgs = {
    shared: ServerChartsConfig;
    params: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
};

// eslint-disable-next-line complexity
export const buildChartsConfigPrivate = (
    args: BuildChartConfigArgs & {features: FeatureConfig},
) => {
    const {shared: serverChartConfig, params, widgetConfig, features} = args;
    const shared = mapChartsConfigToServerConfig(serverChartConfig);
    const {visualization} = shared;

    let hideHolidaysBands = !features[Feature.HolidaysOnChart];
    if (!hideHolidaysBands) {
        hideHolidaysBands = [visualization].concat(visualization.layers || []).some((layer) => {
            return layer.placeholders.some((placeholder) => {
                return (
                    placeholder.id === PlaceholderId.X &&
                    (placeholder.settings?.holidays || 'off') === 'off'
                );
            });
        });
    }

    const config: Partial<Config> = {
        title: shared.title,
        hideHolidaysBands,
        linesLimit: DEFAULT_CHART_LINES_LIMIT,
        tooltip: {pin: {altKey: true}, sort: {enabled: true}},
    };

    if (shared.extraSettings) {
        if (shared.extraSettings.title && shared.extraSettings.titleMode === 'show') {
            config.title = shared.extraSettings.title;
        }

        const isPivotFallbackEnabled = shared.extraSettings?.pivotFallback === 'on';

        if (
            visualization.id === WizardVisualizationId.FlatTable ||
            (visualization.id === WizardVisualizationId.PivotTable && !isPivotFallbackEnabled)
        ) {
            const tableExtraSettings = shared.extraSettings;
            const items = getAllPlaceholderItems(shared.visualization.placeholders);
            const hasDimentions = items.some(({type}) => type === 'DIMENSION');

            // No pagination if all columns are measures
            (config as TableConfig).paginator = {
                enabled: hasDimentions && tableExtraSettings?.pagination === 'on',
                limit: tableExtraSettings?.limit && tableExtraSettings?.limit,
            };
        }

        config.comments = {
            matchType: CommentsMatchType.Intersection,
        };

        const matchedParams: string[] = [];
        if (shared.datasetsPartialFields) {
            shared.datasetsPartialFields.forEach((fields) =>
                fields.forEach((field) => params[field.title] && matchedParams.push(field.title)),
            );

            config.comments.matchedParams = matchedParams;
        }

        if (shared.extraSettings.feed) {
            config.comments.feeds = [
                {
                    feed: shared.extraSettings.feed,
                    matchedParams,
                    matchType: CommentsMatchType.Intersection,
                },
            ];
        }

        if (getIsNavigatorEnabled(shared)) {
            config.navigatorSettings = shared.extraSettings.navigatorSettings;
        }

        config.enableGPTInsights = shared.extraSettings.enableGPTInsights;
    }

    const visualizationId = shared.visualization.id;
    if (
        visualizationId === 'line' ||
        visualizationId === 'area' ||
        visualizationId === 'area100p' ||
        visualizationId === 'column' ||
        visualizationId === 'column100p' ||
        visualizationId === 'bar' ||
        visualizationId === 'bar100p'
    ) {
        config.manageTooltipConfig = ChartkitHandlers.WizardManageTooltipConfig;

        const extraSettings = shared.extraSettings;
        if (extraSettings) {
            const {tooltipSum} = extraSettings;

            if (typeof tooltipSum === 'undefined' || tooltipSum === 'on') {
                config.enableSum = true;
            }
        }
    } else if (visualizationId === 'pie' || visualizationId === 'donut') {
        config.showPercentInTooltip = true;
    } else if (visualizationId === 'metric') {
        (config as MetricConfig).metricVersion = 2;
    } else if (visualizationId === 'pivotTable') {
        (config as TableConfig).settings = {
            highlightRows: false,
            externalSort: true,
        };
    }

    const placeholders = shared.visualization.placeholders;
    const colors = shared.colors;

    if (isNeedToCalcClosestPointManually(visualizationId, placeholders, colors)) {
        // Highcharts can't calculate column sizes automatically for different series.
        // Therefore, if we have a columns/bar visualization type and the colors contain a field, then we will calculate the fields ourselves
        // Because the data format without colors is {series: [{data: [...]}]}
        // And with colors {series: [{data: [...]}, {data: [...]}, {data: [...]}];
        config.calcClosestPointManually = true;
    }

    if (widgetConfig?.actionParams?.enable && canUseActionParams(shared)) {
        (config as ConfigWithActionParams).events = getActionParamsEvents(
            visualizationId as WizardVisualizationId,
        );
    }

    log('CONFIG:');
    log(config);

    return config;
};

export const buildChartsConfig = (
    args: BuildChartConfigArgs | ServerChartsConfig,
    _params?: StringParams,
) => {
    let shared;
    let params: StringParams;
    let widgetConfig: DashWidgetConfig['widgetConfig'];

    if ('shared' in args) {
        shared = args.shared;
        params = args.params as StringParams;
        widgetConfig = args.widgetConfig;
    } else {
        shared = args;
        params = _params as StringParams;
    }

    const app = registry.getApp();
    return buildChartsConfigPrivate({
        shared,
        params,
        widgetConfig,
        features: getServerFeatures(app.nodekit.ctx),
    });
};
