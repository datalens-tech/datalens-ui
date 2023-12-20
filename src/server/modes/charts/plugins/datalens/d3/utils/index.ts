import {ChartKitWidgetTitle} from '@gravity-ui/chartkit';

import {
    ServerCommonSharedExtraSettings,
    ServerField,
    ServerPlaceholderSettings,
    getAxisMode,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';

export function getChartTitle(
    settings?: ServerCommonSharedExtraSettings,
): ChartKitWidgetTitle | undefined {
    if (settings?.titleMode !== 'hide' && settings?.title) {
        return {
            text: settings.title,
        };
    }

    return undefined;
}

export function getAxisType(field?: ServerField, settings?: ServerPlaceholderSettings) {
    const axisMode = getAxisMode(settings, field?.guid);

    if (axisMode !== 'discrete') {
        if (isDateField(field)) {
            return 'datetime';
        }

        if (isNumberField(field)) {
            return 'linear';
        }
    }

    if (field) {
        return 'category';
    }

    return undefined;
}
