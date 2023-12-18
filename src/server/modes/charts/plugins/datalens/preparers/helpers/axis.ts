import {
    AxisMode,
    ServerField,
    ServerPlaceholderSettings,
    getAxisMode,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';

export function getAxisType(field?: ServerField, settings?: ServerPlaceholderSettings) {
    const axisMode = getAxisMode(settings, field?.guid);

    if (axisMode !== AxisMode.Discrete) {
        if (isDateField(field)) {
            return 'datetime';
        }

        if (isNumberField(field)) {
            return settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';
        }
    }

    if (field) {
        return 'category';
    }

    return undefined;
}
