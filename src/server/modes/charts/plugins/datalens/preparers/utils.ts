import type {ServerField} from '../../../../../../shared';
import {isMeasureValue, isNumberField} from '../../../../../../shared';
import type {FormatNumberOptions} from '../../../../../../shared/modules/format-units/types';
import {getFieldFormatOptions} from '../gravity-charts/utils/format';

import type {ChartKitFormatSettings} from './types';

export function mapToGravityChartValueFormat({
    field,
    formatSettings,
}: {
    field: ServerField;
    formatSettings: ChartKitFormatSettings;
}) {
    const isNumber = isNumberField(field) || isMeasureValue(field);
    if (isNumber && formatSettings) {
        return {
            type: 'number',
            precision: formatSettings.chartKitPrecision,
            showRankDelimiter: formatSettings.chartKitShowRankDelimiter,
            labelMode: formatSettings.chartKitLabelMode,
            format: formatSettings.chartKitFormat as FormatNumberOptions['format'], // ?
            prefix: formatSettings.chartKitPrefix,
            postfix: formatSettings.chartKitPostfix,
            unit: formatSettings.chartKitUnit as FormatNumberOptions['unit'],
        };
    }

    return getFieldFormatOptions({field});
}
