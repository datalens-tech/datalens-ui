import type {ServerPlaceholderSettings} from '../../../../../../../../shared';
import {AxisMode, isDateField, isNumberField} from '../../../../../../../../shared';

export function getAxisType(args: {
    field?: {guid: string; data_type: string};
    settings?: ServerPlaceholderSettings;
    axisMode?: AxisMode;
}) {
    const {field, settings} = args;
    let axisMode = args.axisMode;
    if (!axisMode && field?.guid) {
        axisMode = settings?.axisModeMap?.[field.guid];
    }

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
