import type {BarYSeries, ValueFormat} from '@gravity-ui/chartkit/gravity-charts';
import get from 'lodash/get';

import type {ExtendedAreaSeries} from '../../preparers/area/types';
import type {ExtendedBarXSeries} from '../../preparers/bar-x/types';
import type {ExtendedLineSeries} from '../../preparers/line/types';

type ValueFormatPrecision = Extract<ValueFormat, {type: 'number'}>['precision'];

export function getTotalsPrecisionFromSeriesTooltips(
    series: BarYSeries[] | ExtendedAreaSeries[] | ExtendedBarXSeries[] | ExtendedLineSeries[],
): ValueFormatPrecision {
    const precisionValues = series.reduce<number[]>((acc, s) => {
        const precision = get(s, 'tooltip.valueFormat.precision');

        if (typeof precision === 'number') {
            acc.push(precision);
        }

        return acc;
    }, []);

    if (precisionValues.length === 0) {
        return 'auto';
    }

    return Math.max(0, ...precisionValues);
}
