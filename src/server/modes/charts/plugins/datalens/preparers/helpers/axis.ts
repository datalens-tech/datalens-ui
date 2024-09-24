import type {ServerPlaceholderSettings} from '../../../../../../../shared';
import {AxisMode, isDateField, isNumberField} from '../../../../../../../shared';

export function getAxisType(args: {
    field?: {guid: string; data_type: string};
    axisMode?: AxisMode;
    settings?: ServerPlaceholderSettings;
}) {
    const {field, axisMode, settings} = args;

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
