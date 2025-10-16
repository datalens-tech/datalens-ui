import type {AxisPlotBand, AxisPlotLine, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import get from 'lodash/get';
import type {ChartComment} from 'shared/types';

export function convertChartCommentsToPlotBandsAndLines({comments}: {comments: ChartComment[]}) {
    const plotLines: AxisPlotLine[] = [];
    const plotBands: AxisPlotBand[] = [];

    comments.forEach((comment) => {
        switch (comment.type) {
            case 'band-x': {
                const item: AxisPlotBand = {
                    from: new Date(comment.date).getTime(),
                    to: new Date(comment.dateUntil ?? '').getTime(),
                    color: String(comment.meta.color),
                    opacity: 0.5,
                    layerPlacement: comment.meta.zIndex === 0 ? 'before' : 'after',
                    label: {
                        text: comment.text,
                    },
                };
                plotBands.push(item);
                break;
            }
            case 'line-x': {
                plotLines.push({
                    value: new Date(comment.date).getTime(),
                    color: String(comment.meta.color),
                    width: Number(comment.meta.width),
                    dashStyle: String(comment.meta.dashStyle) as AxisPlotLine['dashStyle'],
                    opacity: 1,
                    layerPlacement: comment.meta.zIndex === 0 ? 'before' : 'after',
                    label: {
                        text: comment.text,
                    },
                });
                break;
            }
        }
    });

    return {plotLines, plotBands};
}

export function shouldUseCommentsOnYAxis(chartData: ChartData) {
    return chartData.series?.data?.some((s) => s.type === 'bar-y');
}

export function getCommentsInterval(chartData: ChartData) {
    let dateMin = Infinity;
    let dateMax = 0;

    const fieldName = shouldUseCommentsOnYAxis(chartData) ? 'y' : 'x';

    chartData.series.data.forEach((s) => {
        s.data.forEach((d) => {
            const value = get(d, fieldName, 0);
            if (typeof value === 'number') {
                dateMin = Math.min(dateMin, value);
                dateMax = Math.max(dateMax, value);
            }
        });
    });

    return {min: dateMin, max: dateMax};
}
