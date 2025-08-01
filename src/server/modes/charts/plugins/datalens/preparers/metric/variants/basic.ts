import {dateTime} from '@gravity-ui/date-utils';

import type {
    CommonNumberFormattingOptions,
    NumberFormatType,
    NumberFormatUnit,
    ServerCommonSharedExtraSettings,
} from '../../../../../../../../shared';
import {MINIMUM_FRACTION_DIGITS, isDateField} from '../../../../../../../../shared';
import {isFloatDataType, isNumericalDataType} from '../../../utils/misc-helpers';
import {getTitle} from '../utils';

type MetricCurrent = {
    value: string | number | null;
    precision?: number;
    format?: NumberFormatType;
    postfix?: string;
    prefix?: string;
    showRankDelimiter?: boolean;
    unit?: NumberFormatUnit;
};

type MetricConfig = {
    content: {
        current: MetricCurrent;
    };
    title: string;
    size: string;
    color: string;
};

export const prepareBasicMetricVariant = ({
    measure,
    value,
    extraSettings,
    currentPalette,
}: {
    measure: any;
    value: string | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
    currentPalette: string[];
}) => {
    const current: MetricCurrent = {value};
    if (measure && isNumericalDataType(measure.data_type)) {
        current.value = Number(current.value);
        const measureFormatting = measure.formatting as CommonNumberFormattingOptions | undefined;

        if (measureFormatting) {
            current.format = measureFormatting.format;
            current.postfix = measureFormatting.postfix;
            current.prefix = measureFormatting.prefix;
            current.showRankDelimiter = measureFormatting.showRankDelimiter;
            current.unit = measureFormatting.unit;
            current.precision =
                isFloatDataType(measure.data_type) &&
                typeof measureFormatting.precision !== 'number'
                    ? MINIMUM_FRACTION_DIGITS
                    : measureFormatting.precision;
        } else if (isFloatDataType(measure.data_type)) {
            current.precision = MINIMUM_FRACTION_DIGITS;
        }
    } else if (current.value && isDateField(measure) && measure.format) {
        current.value = dateTime({input: current.value}).format(measure.format);
    }

    const size = (extraSettings && extraSettings.metricFontSize) || '';

    const colorIndex = extraSettings?.metricFontColorIndex;
    const colorByIndex = colorIndex ? currentPalette[colorIndex] : '';
    const customColor = extraSettings?.metricFontColor;

    const color = colorByIndex || customColor || currentPalette[0];
    const title = getTitle(extraSettings, measure);

    const metric: MetricConfig = {
        content: {
            current,
        },
        size,
        color,
        title,
    };

    return [metric];
};
