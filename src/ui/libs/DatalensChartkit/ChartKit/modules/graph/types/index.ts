import type {FormatNumberOptions} from 'shared/modules/format-units/types';

export type ChartKitFormatNumberSettings = {
    chartKitFormatting?: boolean;
    chartKitFormat?: FormatNumberOptions['format'];
    chartKitPostfix?: FormatNumberOptions['postfix'];
    chartKitPrecision?: FormatNumberOptions['precision'];
    chartKitPrefix?: FormatNumberOptions['prefix'];
    chartKitShowRankDelimiter?: FormatNumberOptions['showRankDelimiter'];
    chartKitUnit?: FormatNumberOptions['unit'];
    chartKitLabelMode?: FormatNumberOptions['labelMode'];
};

export enum HighchartsType {
    Area = 'area',
    Arearange = 'arearange',
    Bar = 'bar',
    Boxplot = 'boxplot',
    Bubble = 'bubble',
    Column = 'column',
    Columnrange = 'columnrange',
    Funnel = 'funnel',
    Heatmap = 'heatmap',
    Line = 'line',
    Map = 'map',
    Networkgraph = 'networkgraph',
    Pie = 'pie',
    Sankey = 'sankey',
    Scatter = 'scatter',
    Streamgraph = 'streamgraph',
    Timeline = 'timeline',
    Treemap = 'treemap',
    Variwide = 'variwide',
    Waterfall = 'waterfall',
    Wordcloud = 'wordcloud',
    Xrange = 'xrange',
}
