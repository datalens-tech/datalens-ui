import type {ValueFormat} from '@gravity-ui/chartkit/gravity-charts';

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
        return mapChartkitFormatSettingsToGravityChartValueFormat({
            chartkitFormatSettings: formatSettings,
        });
    }

    return getFieldFormatOptions({field});
}

export function mapChartkitFormatSettingsToGravityChartValueFormat(args: {
    type?: ValueFormat['type'];
    chartkitFormatSettings?: ChartKitFormatSettings;
}): ValueFormat {
    const {chartkitFormatSettings = {}, type = 'number'} = args;

    return {
        format: chartkitFormatSettings.chartKitFormat as FormatNumberOptions['format'],
        labelMode: chartkitFormatSettings.chartKitLabelMode,
        postfix: chartkitFormatSettings.chartKitPostfix,
        precision: chartkitFormatSettings.chartKitPrecision,
        prefix: chartkitFormatSettings.chartKitPrefix,
        showRankDelimiter: chartkitFormatSettings.chartKitShowRankDelimiter,
        type,
        unit: chartkitFormatSettings.chartKitUnit as FormatNumberOptions['unit'],
    };
}
