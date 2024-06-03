import type {
    ServerPlaceholderSettings,
    ServerSort,
    WizardVisualizationId,
} from '../../../../../../../shared';
import {
    AxisMode,
    getActualAxisModeForField,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';

export function getAxisType(args: {
    field?: {guid: string; data_type: string};
    settings?: ServerPlaceholderSettings;
    visualizationIds: WizardVisualizationId[];
    sort: ServerSort[];
}) {
    const {field, settings, visualizationIds, sort} = args;

    let axisMode = AxisMode.Discrete;
    if (field) {
        axisMode = getActualAxisModeForField({
            field,
            axisSettings: settings,
            visualizationIds,
            sort,
        }) as AxisMode;
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
