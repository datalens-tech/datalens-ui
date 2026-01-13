import {ChartKitCustomError} from 'ui/libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import type {AdvancedChartWidgetData} from '../../types';

export function validateWidgetData(data: AdvancedChartWidgetData) {
    if (typeof data.render !== 'function') {
        throw new ChartKitCustomError(
            'The required render function is missing from the chart configuration.',
            {details: 'Please define it within your config using Editor.wrapFn.'},
        );
    }

    return;
}
