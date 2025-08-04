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
    const config = loadedData?.libraryConfig as ChartData;
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
            renderer: getTooltipRenderer({widgetData, qa: `chartkit-tooltip-entry-${chartId}`}),
        },
        series: getStyledSeries(loadedData),
    };

    chartWidgetData.series?.data.forEach((s) => {
        set(s, 'legend.symbol.padding', 8);

        set(s, 'dataLabels.padding', 10);
        set(s, 'dataLabels.style', {
            fontSize: '12px',
            fontWeight: 500,
            ...s.dataLabels?.style,
        });

        switch (s.type) {
            case 'pie': {
                const totals = get(s, 'custom.totals');
                const renderCustomShapeFn = get(s, 'renderCustomShape') as any;

                if (renderCustomShapeFn) {
                    s.renderCustomShape = getCustomShapeRenderer(renderCustomShapeFn);
                } else if (typeof totals !== 'undefined') {
                    s.renderCustomShape = CustomShapeRenderer.pieCenterText(totals, {padding: 36});
                }

                break;
            }
        }
    });

    return merge({}, config, widgetData, chartWidgetData);
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
