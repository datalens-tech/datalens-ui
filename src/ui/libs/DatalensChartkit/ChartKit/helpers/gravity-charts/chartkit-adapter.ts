import type {ChartData, ChartSeriesData} from '@gravity-ui/chartkit/gravity-charts';
import {CustomShapeRenderer} from '@gravity-ui/chartkit/gravity-charts';
import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import get from 'lodash/get';
import merge from 'lodash/merge';
import set from 'lodash/set';

import type {GraphWidget} from '../../../types';
import type {ChartKitAdapterProps} from '../../types';
import {getTooltipRenderer} from '../tooltip';
import {getNormalizedClickActions} from '../utils';

import {convertChartCommentsToPlotBandsAndLines} from './comments';
import {handleClick} from './event-handlers';
import {
    getCustomShapeRenderer,
    isPointSelected,
    setPointSelectState,
    setSeriesSelectState,
} from './utils';

export function getGravityChartsChartKitData(args: {
    loadedData: ChartKitAdapterProps['loadedData'];
    onChange?: ChartKitAdapterProps['onChange'];
}) {
    const {loadedData, onChange} = args;
    const widgetData = loadedData?.data as ChartData;
    const chartId = loadedData?.entryId;

    const chartWidgetData: Partial<ChartData> = {
        chart: {
            events: {
                click: (data, event) => {
                    handleClick({
                        widgetData: loadedData as GraphWidget,
                        point: data.point,
                        series: widgetData.series.data.find(
                            (s) => get(s, 'name') === get(data.series, 'name'),
                        ),
                        event,
                        onChange,
                    });
                },
            },
        },
        legend: {
            justifyContent: 'start',
            itemDistance: 24,
            itemStyle: {
                fontSize: '13px',
            },
        },
        tooltip: {
            pin: {enabled: true, modifierKey: 'altKey'},
        },
        series: getStyledSeries(loadedData),
    };

    const result = merge({}, chartWidgetData, widgetData);
    if (result.tooltip) {
        result.tooltip.renderer = getTooltipRenderer({
            widgetData,
            qa: `chartkit-tooltip-entry-${chartId}`,
        });
    }

    result.series?.data.forEach((s) => {
        set(s, 'legend.symbol', {
            padding: 8,
            width: 10,
            height: 10,
            ...s.legend?.symbol,
        });

        s.dataLabels = {
            padding: 10,
            ...s.dataLabels,
            style: {
                fontSize: '12px',
                fontWeight: '500',
                ...s.dataLabels?.style,
            },
        };

        switch (s.type) {
            case 'pie': {
                const totals = get(s, 'custom.totals');
                const renderCustomShapeFn = get(s, 'renderCustomShape') as any;

                if (renderCustomShapeFn) {
                    s.renderCustomShape = getCustomShapeRenderer(renderCustomShapeFn);
                } else if (typeof totals !== 'undefined') {
                    s.renderCustomShape = CustomShapeRenderer.pieCenterText(totals, {
                        padding: '25%',
                        minFontSize: 6,
                    });
                }

                break;
            }
        }
    });

    const hideComments = get(loadedData, 'config.hideComments', false);
    const comments = hideComments ? [] : get(loadedData, 'comments', []);
    const {plotBands, plotLines} = convertChartCommentsToPlotBandsAndLines({comments});

    const shouldUseCommentsOnYAxis = result.series?.data?.some((s) => s.type === 'bar-y');
    if (shouldUseCommentsOnYAxis) {
        set(result, 'yAxis[0].plotBands', [...(result.yAxis?.[0]?.plotBands ?? []), ...plotBands]);
        set(result, 'yAxis[0].plotLines', [...(result.yAxis?.[0]?.plotLines ?? []), ...plotLines]);
    } else {
        set(result, 'xAxis.plotBands', [...(result.xAxis?.plotBands ?? []), ...plotBands]);
        set(result, 'xAxis.plotLines', [...(result.xAxis?.plotLines ?? []), ...plotLines]);
    }

    return result;
}

function getStyledSeries(loadedData: ChartKitAdapterProps['loadedData']) {
    const widgetData = loadedData?.data as ChartData;
    const clickActions = getNormalizedClickActions(loadedData as GraphWidget);
    const clickScope = clickActions.find((a) => {
        const handlers = Array.isArray(a.handler) ? a.handler : [a.handler];
        return handlers.some((h) => h.type === 'setActionParams');
    });
    const actionParams = pickActionParamsFromParams(get(loadedData, 'unresolvedParams', {}));

    if (clickScope?.scope === 'point' && Object.keys(actionParams).length > 0) {
        const chartSeries = widgetData.series.data;
        const hasSomePointSelected = chartSeries.some((s) =>
            s.data.some((p) => isPointSelected(p, s, actionParams)),
        );

        if (hasSomePointSelected) {
            chartSeries.forEach((s) => {
                const points = s.data as ChartSeriesData[];
                const hasAnySelectedPoints = points.reduce((acc, p: ChartSeriesData) => {
                    const pointSelected = isPointSelected(p, s, actionParams);
                    setPointSelectState({point: p, series: s, selected: pointSelected});
                    return acc || pointSelected;
                }, false);
                setSeriesSelectState({series: s, selected: hasAnySelectedPoints});
            });
        }
    }

    return widgetData.series;
}
