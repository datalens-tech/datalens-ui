import {formatNumber} from 'shared/modules/format-units/formatUnit';

import type {ChartKitFormatNumberSettings} from '../../types';

export const getChartKitFormattedValue = (
    chartKitFormatSettings: ChartKitFormatNumberSettings,
    value: number,
    percentage: number,
) => {
    const {
        chartKitPrecision,
        chartKitPrefix,
        chartKitPostfix,
        chartKitUnit,
        chartKitFormat,
        chartKitLabelMode,
        chartKitShowRankDelimiter,
    } = chartKitFormatSettings;

    const formatOptions = {
        precision: chartKitPrecision,
        prefix: chartKitPrefix,
        postfix: chartKitPostfix,
        format: chartKitFormat,
        showRankDelimiter: chartKitShowRankDelimiter,
        unit: chartKitUnit,
        labelMode: chartKitLabelMode,
    };

    const valueToFormat = chartKitLabelMode === 'percent' ? percentage : value;

    return formatNumber(valueToFormat, formatOptions);
};
