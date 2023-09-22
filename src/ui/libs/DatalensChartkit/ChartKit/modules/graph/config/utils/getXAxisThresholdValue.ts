import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

export const getXAxisThresholdValue = (
    graphs: Record<string, any>[],
    operation: 'min' | 'max',
): number | null => {
    const xAxisValues = graphs.reduce((acc: number[], series: Record<string, any>) => {
        const data = series.data || [];

        return [...acc, ...data.map((point: Highcharts.Point) => point.x)];
    }, [] as number[]);
    const fn = operation === 'min' ? Math.min : Math.max;

    const xAxisValue = fn(...xAxisValues);

    return isFinite(xAxisValue) ? xAxisValue : null;
};
