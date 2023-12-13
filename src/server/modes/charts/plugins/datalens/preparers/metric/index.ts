import {dateTime} from '@gravity-ui/date-utils';

import {
    CommonNumberFormattingOptions,
    MINIMUM_FRACTION_DIGITS,
    NumberFormatType,
    NumberFormatUnit,
    getFakeTitleOrTitle,
    isDateField,
} from '../../../../../../../shared';
import {findIndexInOrder, isFloatDataType, isNumericalDataType} from '../../utils/misc-helpers';

import {PrepareFunctionArgs} from './../types';

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

function prepareMetric({placeholders, resultData, shared, idToTitle}: PrepareFunctionArgs) {
    const {data, order} = resultData;

    const measure = placeholders[0].items[0];

    const measureActualTitle = idToTitle[measure.guid];
    const measureIndex = findIndexInOrder(order, measure, measureActualTitle);

    const value = data[0][measureIndex];
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

    const size = (shared.extraSettings && shared.extraSettings.metricFontSize) || '';
    const color = (shared.extraSettings && shared.extraSettings.metricFontColor) || '';
    let title;

    if (
        shared.extraSettings &&
        shared.extraSettings.title &&
        shared.extraSettings.titleMode === 'show'
    ) {
        title = shared.extraSettings.title;
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
}

export default prepareMetric;
