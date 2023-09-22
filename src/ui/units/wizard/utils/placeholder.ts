import {
    Field,
    Placeholder,
    PlaceholderSettings,
    Shared,
    WizardVisualizationId,
    isAllAxisModesAvailable,
    isFieldHierarchy,
} from 'shared';
import {SETTINGS} from 'ui/constants/visualizations';

type GetAxisModePlaceholderSettings = {
    sort: Field[];
    visualization: Shared['visualization'];
    placeholder: Placeholder;
    firstField: Field;
};
export const getAxisModePlaceholderSettings = ({
    placeholder,
    visualization,
    sort,
    firstField,
}: GetAxisModePlaceholderSettings) => {
    const settings: PlaceholderSettings & {axisModeMap: Record<string, string>} = {axisModeMap: {}};
    const isSortItemExists = sort.length;
    const isAreaChart = visualization.id === WizardVisualizationId.Area;
    const isContinuousModeRestricted = isSortItemExists && !isAreaChart;

    let fields: Field[];
    let currentField: Field;
    if (isFieldHierarchy(firstField)) {
        fields = firstField.fields;
        currentField = firstField.fields[0];
    } else {
        fields = [firstField];
        currentField = firstField;
    }

    if (currentField) {
        fields.forEach((field) => {
            if (placeholder.settings?.axisModeMap?.[field.guid]) {
                settings.axisModeMap[field.guid] = placeholder.settings.axisModeMap[field.guid];
            } else if (isAllAxisModesAvailable(field) && !isContinuousModeRestricted) {
                settings.axisModeMap[field.guid] = SETTINGS.AXIS_MODE.CONTINUOUS;
            } else {
                settings.axisModeMap[field.guid] = SETTINGS.AXIS_MODE.DISCRETE;
            }
        });

        const currentAxisMode = settings.axisModeMap[currentField.guid];

        if (
            currentAxisMode === SETTINGS.AXIS_MODE.DISCRETE &&
            placeholder.settings?.gridStep === SETTINGS.GRID_STEP.MANUAL
        ) {
            settings.gridStep = SETTINGS.GRID_STEP.AUTO;
            settings.gridStepValue = undefined;
        }
    }

    return settings;
};

export const getFirstFieldInPlaceholder = (placeholder: Placeholder, drillDownLevel?: number) => {
    return isFieldHierarchy(placeholder.items[0]) && typeof drillDownLevel !== 'undefined'
        ? placeholder.items[0].fields[drillDownLevel]
        : placeholder.items[0];
};
