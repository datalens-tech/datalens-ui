import type {ServerPlaceholder} from '../../../../../../../../shared';
import {AxisLabelFormatMode} from '../../../../../../../../shared';

import {getAxisFormattingByField} from './getAxisFormattingByField';
import {getAxisFormattingManual} from './getAxisFormattingManual';

export const getAxisFormatting = (placeholder: ServerPlaceholder, visualizationId: string) => {
    switch (placeholder.settings?.axisFormatMode) {
        case AxisLabelFormatMode.ByField:
            return getAxisFormattingByField(placeholder, visualizationId);
        case AxisLabelFormatMode.Manual:
            return getAxisFormattingManual(placeholder, visualizationId);
        default:
            return null;
    }
};
