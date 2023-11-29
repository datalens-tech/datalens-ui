import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';

import {DEFAULT_CHART_LINES_LIMIT, Feature, isEnabledServerFeature} from '../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';
import type {QlConfig} from '../../../../../shared/types/config/ql';
import {registry} from '../../../../registry';

import {log} from './utils/misc-helpers';

export default ({shared}: {shared: QlConfig}) => {
    const qlConfig = mapQlConfigToLatestVersion(shared);

    const config: Pick<
        HighchartsWidgetData['config'],
        'title' | 'hideHolidaysBands' | 'linesLimit' | 'tooltip'
    > & {
        enableGPTInsights?: boolean;
    } = {
        tooltip: {pin: {altKey: true}, sort: {enabled: true}},
    };

    if (qlConfig.extraSettings) {
        if (qlConfig.extraSettings.title && qlConfig.extraSettings.titleMode === 'show') {
            config.title = qlConfig.extraSettings.title;
        }

        config.enableGPTInsights = qlConfig.extraSettings.enableGPTInsights;
    }

    const app = registry.getApp();

    config.hideHolidaysBands = !isEnabledServerFeature(app.nodekit.ctx, Feature.HolidaysOnChart);
    config.linesLimit = DEFAULT_CHART_LINES_LIMIT;

    log('CONFIG:', config);

    return config;
};
