import {dateTime} from '@gravity-ui/date-utils';

import {
    CommonNumberFormattingOptions,
    MINIMUM_FRACTION_DIGITS,
    NumberFormatType,
    NumberFormatUnit,
    ServerCommonSharedExtraSettings,
    getFakeTitleOrTitle,
    isDateField,
} from '../../../../../../../../shared';
import {isFloatDataType, isNumericalDataType} from '../../../utils/misc-helpers';

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
}: {
    measure: any;
    value: string | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
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
    const color = (extraSettings && extraSettings.metricFontColor) || '';
    let title;

    if (extraSettings && extraSettings.title && extraSettings.titleMode === 'show') {
        title = extraSettings.title;
    } else {
        title = getFakeTitleOrTitle(measure);
    }

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
