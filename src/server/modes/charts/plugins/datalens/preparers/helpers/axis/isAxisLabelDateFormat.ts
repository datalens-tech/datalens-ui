import type {ServerField, ServerPlaceholderSettings} from '../../../../../../../../shared';
import {AxisLabelFormatMode, isDateField} from '../../../../../../../../shared';

export const isAxisLabelDateFormat = (
    settings?: ServerPlaceholderSettings,
    field?: ServerField,
    axisType?: string,
) => {
    const {axisFormatMode, axisLabelDateFormat} = settings || {};
    return (
        axisFormatMode === AxisLabelFormatMode.Manual &&
        isDateField(field) &&
        axisType === 'datetime' &&
        axisLabelDateFormat !== 'auto'
    );
};
