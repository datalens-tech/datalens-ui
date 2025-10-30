import type {ValueFormat} from '@gravity-ui/chartkit/gravity-charts';

import type {FormatNumberOptions} from '../../../../../../shared/modules/format-units/types';

import type {ChartKitFormatSettings} from './types';

export function mapToGravityChartValueFormat(old: ChartKitFormatSettings): ValueFormat {
    return {
        type: 'number',
        precision: old.chartKitPrecision,
        showRankDelimiter: old.chartKitShowRankDelimiter,
        labelMode: old.chartKitLabelMode,
        format: old.chartKitFormat as FormatNumberOptions['format'], // ?
        prefix: old.chartKitPrefix,
        postfix: old.chartKitPostfix,
        unit: old.chartKitUnit as FormatNumberOptions['unit'],
    };
}
