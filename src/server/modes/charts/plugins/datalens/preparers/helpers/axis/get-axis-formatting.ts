import type {ServerPlaceholder} from '../../../../../../../../shared';
import {
    AxisLabelFormatMode,
    isNumberField,
    isPercentVisualization,
} from '../../../../../../../../shared';
import {getFormatOptionsFromFieldFormatting} from '../../../utils/misc-helpers';

export const getAxisFormatting = ({
    placeholder,
    visualizationId,
}: {
    placeholder: ServerPlaceholder;
    visualizationId: string;
}) => {
    const field = placeholder?.items?.[0];

    if (!field || !isNumberField(field)) {
        return undefined;
    }

    if (isPercentVisualization(visualizationId)) {
        return undefined;
    }

    switch (placeholder.settings?.axisFormatMode) {
        case AxisLabelFormatMode.ByField:
            return field.formatting ?? {};
        case AxisLabelFormatMode.Manual:
            return placeholder.settings?.axisLabelFormating ?? {};
        default:
            return null;
    }
};

export const getAxisChartkitFormatting = (
    placeholder: ServerPlaceholder,
    visualizationId: string,
) => {
    const axisFormatting = getAxisFormatting({placeholder, visualizationId});

    if (axisFormatting) {
        const field = placeholder?.items?.[0];
        return getFormatOptionsFromFieldFormatting(axisFormatting, field?.data_type);
    }

    return undefined;
};
