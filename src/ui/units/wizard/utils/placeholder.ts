import type {
    AxisMode,
    Field,
    Placeholder,
    PlaceholderSettings,
    ServerChartsConfig,
    ServerField,
} from 'shared';
import {
    PlaceholderId,
    WizardVisualizationId,
    getXAxisMode,
    isDateField,
    isFieldHierarchy,
    isNumberField,
} from 'shared';
import {SETTINGS} from 'ui/constants/visualizations';

type GetAxisModePlaceholderSettings = {
    placeholder: Placeholder;
    firstField: Field;
    chartConfig: Partial<ServerChartsConfig>;
};
export const getAxisModePlaceholderSettings = ({
    placeholder,
    firstField,
    chartConfig,
}: GetAxisModePlaceholderSettings) => {
    const settings: PlaceholderSettings & {axisModeMap: Record<string, string>} = {axisModeMap: {}};

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
            settings.axisModeMap[field.guid] = getXAxisMode({config: chartConfig, xField: field});
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

export function isPlaceholderWithAxisMode(placeholder: Placeholder | undefined) {
    const placeholderSettings = (placeholder?.settings || {}) as PlaceholderSettings;
    return Boolean(placeholderSettings?.axisModeMap);
}

export function getPlaceholderAxisModeMap(args: {placeholder: Placeholder; axisMode: AxisMode}) {
    const {placeholder, axisMode} = args;
    const placeholderSettings = (placeholder.settings || {}) as PlaceholderSettings;
    const axisModeMap = placeholderSettings.axisModeMap || {};
    const firstField = placeholder.items[0];

    if (!firstField) {
        return axisModeMap;
    }

    const fields = isFieldHierarchy(firstField) ? firstField.fields : [firstField];
    return fields.reduce((acc, field) => {
        return Object.assign({}, acc, {[field.guid]: axisMode});
    }, axisModeMap);
}

export function canAddParamToPlaceholder(args: {
    field: ServerField;
    placeholderId: string;
    visualizationId: string;
}) {
    const {field, placeholderId, visualizationId} = args;

    const forbiddenPlaceholderIds: string[] = [
        PlaceholderId.DashboardFilters,
        PlaceholderId.DashboardParameters,
    ];
    if (forbiddenPlaceholderIds.includes(placeholderId)) {
        return false;
    }

    // numbers (and date) are suitable for any placeholder
    if (isNumberField(field) || isDateField(field)) {
        return true;
    }

    switch (visualizationId) {
        case WizardVisualizationId.Line:
        case WizardVisualizationId.Area:
        case WizardVisualizationId.Area100p:
        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p: {
            if ([PlaceholderId.Y, PlaceholderId.Y2].includes(placeholderId as PlaceholderId)) {
                return false;
            }
            return true;
        }
        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p: {
            return placeholderId !== PlaceholderId.X;
        }
    }

    return true;
}
