import type {ServerChartsConfig} from '../../../../../../shared';
import {registry} from '../../../../../registry';

import {buildHighchartsConfigPrivate} from './highcharts';

export function buildHighchartsConfig(
    ...options: [{shared: ServerChartsConfig} | ServerChartsConfig]
) {
    const app = registry.getApp();
    let shared: ServerChartsConfig;
    if ('shared' in options[0]) {
        shared = options[0].shared;
    } else {
        shared = options[0];
    }

    return buildHighchartsConfigPrivate({
        shared,
        features: app.nodekit.ctx.get('getServerFeatures')(),
    });
}
