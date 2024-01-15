import {
    AxisMode,
    ServerPlaceholderSettings,
    ServerSort,
    WizardVisualizationId,
    getActualAxisModeForField,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';

export function getAxisType(args: {
    field?: {guid: string; data_type: string};
    settings?: ServerPlaceholderSettings;
    visualizationId: WizardVisualizationId;
    sort: ServerSort[];
}) {
    const {field, settings, visualizationId, sort} = args;

    let axisMode = AxisMode.Discrete;
    if (field) {
        axisMode = getActualAxisModeForField({
            field,
            axisSettings: settings,
            visualizationId: visualizationId as WizardVisualizationId,
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
