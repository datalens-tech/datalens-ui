import {HighchartsType} from '../../types';

import {isTooltipShared} from './isTooltipShared';

const chartTypes: [HighchartsType, boolean][] = [
    [HighchartsType.Sankey, false],
    [HighchartsType.Xrange, false],
    [HighchartsType.Line, true],
    [HighchartsType.Area, true],
    [HighchartsType.Arearange, true],
    [HighchartsType.Bar, true],
    [HighchartsType.Column, true],
    [HighchartsType.Columnrange, true],
    [HighchartsType.Funnel, true],
    [HighchartsType.Pie, true],
    [HighchartsType.Map, true],
    [HighchartsType.Scatter, true],
    [HighchartsType.Bubble, true],
    [HighchartsType.Heatmap, true],
    [HighchartsType.Treemap, true],
    [HighchartsType.Networkgraph, true],
    [HighchartsType.Variwide, true],
    [HighchartsType.Waterfall, true],
    [HighchartsType.Streamgraph, true],
    [HighchartsType.Wordcloud, true],
    [HighchartsType.Boxplot, true],
    [HighchartsType.Timeline, true],
];

describe('calculatePrecision', () => {
    test.each(chartTypes)(`for %s return %s`, (chartType, assert) => {
        expect(isTooltipShared(chartType)).toBe(assert);
    });
});
