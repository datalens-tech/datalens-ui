import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import {ExtendedPointOptionsObject} from '../../utils/color-helpers';

export type ScatterPoint = ExtendedPointOptionsObject & {
    xLabel?: string;
    yLabel?: string;
    cLabel?: string | null;
    sLabel?: string;
    sizeValue?: number | null;
    sizeLabel?: string | null;
    x?: number;
    y?: number;
    value?: number;
    marker?: Highcharts.PointMarkerOptionsObject;
};
