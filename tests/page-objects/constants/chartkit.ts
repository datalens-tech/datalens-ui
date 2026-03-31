export const COMMON_CHARTKIT_SELECTORS = {
    chartkit: 'chartkit',
    graph: 'chartkit-graph',
    chart: '.chartkit-graph, .gcharts-chart',
    scrollableNode: 'chartkit-scrollable-node',
    tooltipContainer: '.highcharts-tooltip-container, .gcharts-tooltip',
    /** Gravity Charts only — does not match Highcharts tooltip markup. */
    tooltipHeader: '.gcharts-tooltip__series-name-text',
    tooltipNameColumn: '._tooltip-rows__name-td, .gcharts-tooltip__content-row-label-cell > span',
    /** Gravity Charts only — does not match Highcharts tooltip markup. */
    tooltipTotalsValue: '.gcharts-tooltip__content-row-totals-value',
    chartLegendItem: '.highcharts-legend-item, .gcharts-legend__item',
};
