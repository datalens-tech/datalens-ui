import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';
import set from 'lodash/set';

import type {FeatureConfig, IChartEditor, QlConfig} from '../../../../../../../shared';
import {
    DEFAULT_CHART_LINES_LIMIT,
    Feature,
    WizardVisualizationId,
} from '../../../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../../../shared/modules/config/ql';
import {log} from '../../utils/misc-helpers';

type BuildChartsConfigArgs = {shared: QlConfig; ChartEditor: IChartEditor; features: FeatureConfig};
type QlChartConfig = Pick<
    HighchartsWidgetData['config'],
    'title' | 'hideHolidaysBands' | 'linesLimit' | 'tooltip' | 'enableSum'
> & {
    enableGPTInsights?: boolean;
};

export function buildChartConfig(args: BuildChartsConfigArgs) {
    const {shared, ChartEditor, features} = args;
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

    if (isTableWidget) {
        set(config, 'settings.width', 'max-content');
    }

    config.hideHolidaysBands = !features[Feature.HolidaysOnChart];
    config.linesLimit = DEFAULT_CHART_LINES_LIMIT;

    log('CONFIG:', config);

    return config;
}
