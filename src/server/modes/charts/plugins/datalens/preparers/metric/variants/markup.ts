import {
    CommonNumberFormattingOptions,
    MINIMUM_FRACTION_DIGITS,
    MarkupItem,
    ServerCommonSharedExtraSettings,
    ServerField,
    formatNumber,
    getFakeTitleOrTitle,
} from '../../../../../../../../shared';
import {isFloatDataType} from '../../../utils/misc-helpers';

export const prepareMarkupMetricVariant = ({
    measure,
    value,
    extraSettings,
}: {
    measure: ServerField;
    value: string | MarkupItem | null;
    extraSettings: ServerCommonSharedExtraSettings | undefined;
}) => {
    const title =
        extraSettings && extraSettings.title && extraSettings.titleMode === 'show'
            ? extraSettings.title
            : getFakeTitleOrTitle(measure);

    if (typeof value === 'object') {
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
                        {
                            type: 'br',
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
        const color = (extraSettings && extraSettings.metricFontColor) || 'rgb(77, 162, 241)';

        const formatOptions: CommonNumberFormattingOptions = {};

        const measureFormatting = measure.formatting as CommonNumberFormattingOptions | undefined;

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

        const formattedValue = formatNumber(value, formatOptions);

        return {
            value: {
                type: 'concat',
                className: `markup-metric markup-metric_size_${size}`,
                children: [
                    {
                        className: 'markup-metric-title',
                        type: 'text',
                        content: title,
                    },
                    {
                        type: 'br',
                    },
                    {
                        type: 'color',
                        color,
                        content: {
                            className: 'markup-metric-value',
                            type: 'text',
                            content: formattedValue,
                        },
                    },
                ],
            },
        };
    }
};
