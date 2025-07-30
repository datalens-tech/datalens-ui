import type {ServerField} from '../../../../../../../shared';
import {
    PlaceholderId,
    WizardVisualizationId,
    getFormatOptions,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';
import {
    chartKitFormatNumberWrapper,
    formatDate,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

export function getFormattedValue(value: string | null, field: ServerField) {
    if (value === null) {
        return null;
    }

    if (isDateField(field)) {
        return formatDate({
            valueType: field.data_type,
            value,
            format: field.format,
        });
    }

    if (isNumberField(field)) {
        return chartKitFormatNumberWrapper(Number(value), {
            lang: 'ru',
            ...getFormatOptions(field),
        });
    }

    return String(value);
}

export function isColoringByMeasure(args: PrepareFunctionArgs) {
    const {colorsConfig, placeholders, idToDataType} = args;
    const colorField = placeholders.find((p) => p.id === PlaceholderId.Colors)?.items[0];

    if (!colorField) {
        return false;
    }

    const colorFieldDataType = idToDataType[colorField.guid] || colorField.data_type;
    const gradientMode = isGradientMode({colorField, colorFieldDataType, colorsConfig});

    return isNumericalDataType(colorFieldDataType) && Boolean(gradientMode);
}

export function isDonut({visualizationId}: {visualizationId: string}) {
    return (
        visualizationId === WizardVisualizationId.Donut ||
        visualizationId === WizardVisualizationId.DonutD3
    );
}
