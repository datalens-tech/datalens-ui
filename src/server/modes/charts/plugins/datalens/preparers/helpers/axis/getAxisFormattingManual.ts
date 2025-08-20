import type {
    CommonNumberFormattingOptions,
    ServerPlaceholder,
} from '../../../../../../../../shared';
import {isNumberField, isPercentVisualization} from '../../../../../../../../shared';
import {getFormatOptionsFromFieldFormatting} from '../../../utils/misc-helpers';

import {getFieldFromPlaceholder} from './getFieldFromPlaceholder';

export const getAxisFormattingManual = (
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

    const formatting =
        placeholder.settings?.axisLabelFormating || ({} as CommonNumberFormattingOptions);
    return getFormatOptionsFromFieldFormatting(formatting, field.data_type);
};
