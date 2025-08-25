import type {Field, WizardVisualizationId} from '../../../../../../shared';
import {
    AxisModeDisabledReason,
    isD3Visualization,
    isDateField,
    isNumberField,
} from '../../../../../../shared';
import {getFormattingDataType} from '../../../utils/helpers';

export function isAxisScaleEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisTypeEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisFormatEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isAxisLabelsRotationEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function isHolidaysEnabled(visualizationId: WizardVisualizationId) {
    return !isD3Visualization(visualizationId);
}

export function getAxisModeTooltipContent(reason: AxisModeDisabledReason) {
    switch (reason) {
        case AxisModeDisabledReason.FieldType:
            return 'label_axis-mode-unavailable-type';
        case AxisModeDisabledReason.HasSortingField:
            return 'label_axis-mode-unavailable-sort-measures';
        case AxisModeDisabledReason.Unknown:
            return 'label_axis-mode-unavailable-forbidden';
        default:
            return '';
    }
}

export const analyzeField = (field: Field) => {
    const formattingDataType = getFormattingDataType(field, field.cast);

    const isNumeric = isNumberField(field);
    const isCastNumeric = isNumberField({data_type: formattingDataType});
    const isDate = isDateField(field);
    const isFormatless = !isCastNumeric && !isDate;

    return {
        formattingDataType,
        isNumeric,
        isCastNumeric,
        isDate,
        isFormatless,
    };
};
