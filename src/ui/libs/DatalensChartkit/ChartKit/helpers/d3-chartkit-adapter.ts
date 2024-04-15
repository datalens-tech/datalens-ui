import {ChartKitWidgetData, ChartKitWidgetSeriesData} from '@gravity-ui/chartkit';
import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import get from 'lodash/get';
import merge from 'lodash/merge';

import {GraphWidget} from '../../types';
import {ChartKitAdapterProps} from '../types';

import {handleClick} from './d3-event-handlers';
import {isPointSelected, setPointSelectState, setSeriesSelectState} from './d3-utils';
import {getTooltipRenderer} from './tooltip';
import {getNormalizedClickActions} from './utils';

export function getD3ChartKitData(args: {
    loadedData: ChartKitAdapterProps['loadedData'];
    onChange?: ChartKitAdapterProps['onChange'];
}) {
    const {loadedData, onChange} = args;
    const widgetData = loadedData?.data as ChartKitWidgetData;
    const config = loadedData?.libraryConfig as ChartKitWidgetData;

    const chartWidgetData: Partial<ChartKitWidgetData> = {
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
        tooltip: {
            ...widgetData.tooltip,
            renderer: getTooltipRenderer(widgetData),
        },
        series: getStyledSeries(loadedData),
    };

    return merge({}, config, widgetData, chartWidgetData);
}

function getStyledSeries(loadedData: ChartKitAdapterProps['loadedData']) {
    const widgetData = loadedData?.data as ChartKitWidgetData;
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
                const points = s.data as ChartKitWidgetSeriesData[];
                const hasAnySelectedPoints = points.reduce((acc, p: ChartKitWidgetSeriesData) => {
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
