import type {AxisPlotBand, AxisPlotLine} from '@gravity-ui/chartkit/gravity-charts';
import type {ChartComment} from 'shared/types';

export function convertChartCommentsToPlotBandsAndLines({comments}: {comments: ChartComment[]}) {
    const plotLines: AxisPlotLine[] = [];
    const plotBands: AxisPlotBand[] = [];

    comments.forEach((comment) => {
        switch (comment.type) {
            case 'band-x': {
                plotBands.push({
                    from: new Date(comment.date).getTime(),
                    to: new Date(comment.dateUntil ?? '').getTime(),
                    color: String(comment.meta.color),
                    opacity: 0.5,
                    layerPlacement: comment.meta.zIndex === 0 ? 'before' : 'after',
                });
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
                });
                break;
            }
        }
    });

    return {plotLines, plotBands};
}
