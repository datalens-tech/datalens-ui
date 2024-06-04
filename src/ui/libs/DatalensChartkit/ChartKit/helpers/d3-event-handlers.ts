import type {
    ChartKitWidgetData,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesData,
} from '@gravity-ui/chartkit';
import {
    pickActionParamsFromParams,
    transformParamsToActionParams,
} from '@gravity-ui/dashkit/helpers';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import type {GraphWidgetEventScope, StringParams} from '../../../../../shared';
import type {GraphWidget, LoadedWidgetData} from '../../types';
import type {ChartKitAdapterProps} from '../types';

import {addParams, subtractParameters} from './action-params-handlers';
import {getPointActionParams, isPointSelected} from './d3-utils';
import {getNormalizedClickActions} from './utils';

type OnClickHandlerArgs = {
    widgetData: LoadedWidgetData;
    point: unknown;
    series: unknown;
    event: PointerEvent;
    onChange?: ChartKitAdapterProps['onChange'];
};

export function handleClick(args: OnClickHandlerArgs) {
    const {widgetData, event, onChange, point, series} = args;
    const clickActions = getNormalizedClickActions(widgetData as GraphWidget);

    clickActions.forEach((action) => {
        const handlers = Array.isArray(action.handler) ? action.handler : [action.handler];
        handlers.forEach((handler) => {
            switch (handler.type) {
                case 'setActionParams': {
                    const actionParams = pickActionParamsFromParams(
                        get(widgetData, 'unresolvedParams', {}),
                    );
                    const clickScope: GraphWidgetEventScope = get(action, 'scope', 'point');
                    setActionParamsByClick({
                        event,
                        onChange,
                        actionParams,
                        clickScope,
                        chartData: widgetData?.data as ChartKitWidgetData,
                        point: point as ChartKitWidgetSeriesData,
                        series: series as ChartKitWidgetSeries,
                    });
                }
            }
        });
    });
}

function setActionParamsByClick(args: {
    chartData?: ChartKitWidgetData;
    point?: ChartKitWidgetSeriesData;
    series?: ChartKitWidgetSeries;
    clickScope: GraphWidgetEventScope;
    event: {metaKey?: boolean};
    onChange?: ChartKitAdapterProps['onChange'];
    actionParams: StringParams;
}) {
    const {
        chartData,
        clickScope,
        event,
        point,
        series,
        onChange,
        actionParams: prevActionParams,
    } = args;
    const multiSelect = Boolean(event.metaKey);
    let newActionParams: StringParams = prevActionParams;

    switch (clickScope) {
        case 'point': {
            if (!point) {
                return;
            }

            const currentPoint = point;
            const currentSeries = series;
            const currentPointParams = getPointActionParams(currentPoint, currentSeries);
            const chartSeries = chartData?.series.data || [];
            const hasSomePointSelected = chartSeries.some((s) =>
                s.data.some((p) => isPointSelected(p, s, prevActionParams)),
            );

            if (hasSomePointSelected) {
                if (isPointSelected(currentPoint, currentSeries, prevActionParams)) {
                    if (multiSelect) {
                        newActionParams = subtractParameters(newActionParams, currentPointParams);
                        chartSeries.forEach((s) => {
                            s.data.forEach((p) => {
                                if (isPointSelected(p, s, newActionParams)) {
                                    const pointParams = getPointActionParams(p, s);
                                    newActionParams = addParams(newActionParams, pointParams);
                                }
                            });
                        });
                    } else {
                        newActionParams = {};
                    }
                } else {
                    if (!multiSelect) {
                        // should remove the selection from the previously selected points
                        chartSeries.forEach((s) => {
                            s.data.forEach((p) => {
                                if (isPointSelected(p, s, prevActionParams)) {
                                    const pointParams = getPointActionParams(p, s);
                                    newActionParams = subtractParameters(
                                        newActionParams,
                                        pointParams,
                                    );
                                }
                            });
                        });
                    }

                    newActionParams = addParams(newActionParams, currentPointParams);
                }
            } else {
                newActionParams = addParams(newActionParams, currentPointParams);
            }

            break;
        }
    }

    if (isEqual(prevActionParams, newActionParams)) {
        return;
    }

    const params = transformParamsToActionParams(newActionParams as StringParams);
    onChange?.(
        {
            type: 'PARAMS_CHANGED',
            data: {params},
        },
        {forceUpdate: true},
        true,
        true,
    );
}
