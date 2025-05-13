import {
    type DashWidgetConfig,
    type ServerChartsConfig,
    type StringParams,
    getServerFeatures,
} from '../../../../../../shared';
import {registry} from '../../../../../registry';

import {buildChartsConfigPrivate} from './config';
import type {BuildChartConfigArgs} from './types';

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
