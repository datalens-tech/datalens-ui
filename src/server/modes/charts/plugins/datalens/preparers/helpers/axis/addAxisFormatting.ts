import {AxisLabelFormatMode, type ServerPlaceholder} from '../../../../../../../../shared';

import {getAxisChartkitFormatting} from './get-axis-formatting';

export const addAxisFormatting = (
    arrToPush: unknown[],
    visualizationId: string,
    placeholder?: ServerPlaceholder,
) => {
    const formatMode = placeholder?.settings?.axisFormatMode;
    if (formatMode && formatMode !== AxisLabelFormatMode.Auto) {
        const formatting = getAxisChartkitFormatting(placeholder, visualizationId);
        if (formatting) {
            arrToPush.push(formatting);
        }
    }
};
