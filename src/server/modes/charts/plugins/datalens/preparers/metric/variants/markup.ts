import {dateTime} from '@gravity-ui/date-utils';

import type {
    CommonNumberFormattingOptions,
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
} from '../../../../../../../../shared';
import {MINIMUM_FRACTION_DIGITS, formatNumber, isDateField} from '../../../../../../../../shared';
import {prepareMetricObject} from '../../../utils/markup-helpers';
import {isFloatDataType, isNumericalDataType} from '../../../utils/misc-helpers';
import {getTitle} from '../utils';

export const prepareMarkupMetricVariant = ({
    measure,
    value,
    extraSettings,
    currentPalette,
}: {
    measure: ServerField;
    value: string | MarkupItem | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
    currentPalette: string[];
}) => {
    if (!measure) {
        return {};
    }

    const title = getTitle(extraSettings, measure);

    if (typeof value === 'object' && value !== null) {
        if (title) {
            return {
                value: {
                    type: 'concat',
                    children: [
                        {
                            type: 'size',
                            size: '16px',
                            content: {
                                className: 'markup-metric-title',
                                type: 'text',
                                content: title,
                            },
                        },
                        value,
                    ],
                },
            };
        } else {
            return {value};
        }
    } else {
        const size = (extraSettings && extraSettings.metricFontSize) || 'm';

        const colorIndex = extraSettings?.metricFontColorIndex;
        const colorByIndex = colorIndex ? currentPalette[colorIndex] : '';

        const color = colorByIndex || extraSettings?.metricFontColor || currentPalette[0];

        const formatOptions: CommonNumberFormattingOptions = {};

        let formattedValue = String(value);

        if (isNumericalDataType(measure.data_type)) {
            const measureFormatting = measure.formatting as
                | CommonNumberFormattingOptions
                | undefined;

            if (measureFormatting) {
                formatOptions.format = measureFormatting.format;
                formatOptions.postfix = measureFormatting.postfix;
                formatOptions.prefix = measureFormatting.prefix;
                formatOptions.showRankDelimiter = measureFormatting.showRankDelimiter;
                formatOptions.unit = measureFormatting.unit;
                formatOptions.precision =
                    isFloatDataType(measure.data_type) &&
                    typeof measureFormatting.precision !== 'number'
                        ? MINIMUM_FRACTION_DIGITS
                        : measureFormatting.precision;
            } else if (isFloatDataType(measure.data_type)) {
                formatOptions.precision = MINIMUM_FRACTION_DIGITS;
            }

            formattedValue = formatNumber(value || 0, formatOptions);
        } else if (isDateField(measure) && measure.format) {
            formattedValue = dateTime({input: value}).format(measure.format);
        }

        return prepareMetricObject({size, title, color, value: formattedValue});
    }
};
