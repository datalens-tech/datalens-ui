import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';
import set from 'lodash/set';

import type {FeatureConfig, IChartEditor, QlConfig} from '../../../../../../../shared';
import {
    DEFAULT_CHART_LINES_LIMIT,
    Feature,
    WizardVisualizationId,
} from '../../../../../../../shared';
import {ChartkitHandlers} from '../../../../../../../shared/constants/chartkit-handlers';
import {mapQlConfigToLatestVersion} from '../../../../../../../shared/modules/config/ql';
import type {DashWidgetConfig} from '../../../../../../../shared/types/charts';
import {log} from '../../utils/misc-helpers';

type BuildChartsConfigArgs = {
    shared: QlConfig;
    ChartEditor: IChartEditor;
    features: FeatureConfig;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
};
type QlChartConfig = Pick<
    HighchartsWidgetData['config'],
    'title' | 'hideHolidaysBands' | 'linesLimit' | 'tooltip' | 'enableSum'
> & {
    enableGPTInsights?: boolean;
    manageTooltipConfig?: ChartkitHandlers.WizardManageTooltipConfig;
};

export function buildChartConfig(args: BuildChartsConfigArgs) {
    const {shared, ChartEditor, features, widgetConfig} = args;
    const qlConfig = mapQlConfigToLatestVersion(shared, {
        i18n: ChartEditor.getTranslation,
    });

    const config: Partial<QlChartConfig> = {
        tooltip: {pin: {altKey: true}, sort: {enabled: true}},
    };

    if (qlConfig.extraSettings) {
        const {title, titleMode, tooltipSum, enableGPTInsights} = qlConfig.extraSettings;

        if (title && titleMode === 'show') {
            config.title = title;
        }

        if (typeof tooltipSum === 'undefined' || tooltipSum === 'on') {
            config.enableSum = true;
        }

        config.enableGPTInsights = enableGPTInsights;
    }

    const visualizationId = qlConfig?.visualization?.id;
    const isTableWidget = visualizationId === WizardVisualizationId.FlatTable;
    const isIndicatorWidget = visualizationId === WizardVisualizationId.Metric;
    const isScatterWidget = visualizationId === WizardVisualizationId.Scatter;
    const isTreemapWidget = visualizationId === WizardVisualizationId.Treemap;

    const isSetManageTooltipConfig =
        !isIndicatorWidget && !isTableWidget && !isScatterWidget && !isTreemapWidget;

    if (isTableWidget) {
        const size = widgetConfig?.size ?? shared?.extraSettings?.size;
        if (size) {
            set(config, 'size', size);
        }

        set(config, 'settings.width', 'max-content');

        if (shared?.extraSettings?.preserveWhiteSpace) {
            set(config, 'preserveWhiteSpace', true);
        }
    }

    config.hideHolidaysBands = !features[Feature.HolidaysOnChart];
    config.linesLimit = DEFAULT_CHART_LINES_LIMIT;

    if (isSetManageTooltipConfig) {
        config.manageTooltipConfig = ChartkitHandlers.WizardManageTooltipConfig;
    }

    log('CONFIG:', config);

    return config;
}
