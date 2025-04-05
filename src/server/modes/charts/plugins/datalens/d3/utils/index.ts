import type {ChartTitle} from '@gravity-ui/chartkit/d3';

import type {ServerCommonSharedExtraSettings} from '../../../../../../../shared';

export function getChartTitle(settings?: ServerCommonSharedExtraSettings): ChartTitle | undefined {
    if (settings?.titleMode !== 'hide' && settings?.title) {
        return {
            text: settings.title,
        };
    }

    return undefined;
}
