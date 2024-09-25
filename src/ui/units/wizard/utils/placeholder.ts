import type {AxisMode, Field, Placeholder, PlaceholderSettings, ServerChartsConfig} from 'shared';
import {getXAxisMode, isFieldHierarchy} from 'shared';
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
