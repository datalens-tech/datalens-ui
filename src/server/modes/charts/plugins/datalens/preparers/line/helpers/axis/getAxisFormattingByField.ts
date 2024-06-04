import type {
    CommonNumberFormattingOptions,
    ServerField,
    ServerPlaceholder,
} from '../../../../../../../../../shared';
import {isNumberField, isPercentVisualization} from '../../../../../../../../../shared';
import {getFormatOptionsFromFieldFormatting} from '../../../../utils/misc-helpers';

export const getFieldFromPlaceholder = (
    placeholder: ServerPlaceholder,
): ServerField | undefined => {
    const placeholderItems = placeholder.items || [];

    return placeholderItems[0];
};

export const getAxisFormattingByField = (
    placeholder: ServerPlaceholder,
    visualizationId: string,
) => {
    const field = getFieldFromPlaceholder(placeholder);

    if (!field || !isNumberField(field)) {
        return undefined;
    }

    if (isPercentVisualization(visualizationId)) {
        return undefined;
    }

    const formatting = field.formatting || ({} as CommonNumberFormattingOptions);
    return getFormatOptionsFromFieldFormatting(formatting, field.data_type);
};
