import {AxisLabelFormatMode, type ServerPlaceholder} from '../../../../../../../../shared';

import {getAxisFormatting} from './getAxisFormatting';

export const addAxisFormatting = (
    arrToPush: unknown[],
    visualizationId: string,
    placeholder?: ServerPlaceholder,
) => {
    const formatMode = placeholder?.settings?.axisFormatMode;
    if (formatMode && formatMode !== AxisLabelFormatMode.Auto) {
        const formatting = getAxisFormatting(placeholder, visualizationId);
        if (formatting) {
            arrToPush.push(formatting);
        }
    }
};
