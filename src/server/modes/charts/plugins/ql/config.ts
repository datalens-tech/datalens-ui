import type {HighchartsWidgetData} from '@gravity-ui/chartkit/highcharts';

import {
    DEFAULT_CHART_LINES_LIMIT,
    Feature,
    QLEntryDataShared,
    isEnabledServerFeature,
} from '../../../../../shared';
import {registry} from '../../../../registry';

import {log} from './utils/misc-helpers';

export default ({shared}: {shared: QLEntryDataShared}) => {
    const config: Pick<
        HighchartsWidgetData['config'],
        'title' | 'hideHolidaysBands' | 'linesLimit' | 'tooltip'
    > & {
        enableGPTInsights?: boolean;
    } = {
        tooltip: {pin: {altKey: true}, sort: {enabled: true}},
    };

    if (shared.extraSettings) {
        if (shared.extraSettings.title && shared.extraSettings.titleMode === 'show') {
            config.title = shared.extraSettings.title;
        }

        config.enableGPTInsights = shared.extraSettings.enableGPTInsights;
    }

    const app = registry.getApp();

    config.hideHolidaysBands = !isEnabledServerFeature(app.nodekit.ctx, Feature.HolidaysOnChart);
    config.linesLimit = DEFAULT_CHART_LINES_LIMIT;

    log('CONFIG:', config);

    return config;
};
