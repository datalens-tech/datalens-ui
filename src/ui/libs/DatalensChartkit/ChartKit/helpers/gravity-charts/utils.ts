import type {ChartKitWidgetSeries, ChartKitWidgetSeriesData} from '@gravity-ui/chartkit';
import get from 'lodash/get';
import set from 'lodash/set';

import type {StringParams} from '../../../../../../shared';
import type {PointActionParams} from '../utils';
import {hasMatchedActionParams} from '../utils';

const Opacity = {
    SELECTED: 1,
    UNSELECTED: 0.5,
};

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';

export function getPointActionParams(
    point: ChartKitWidgetSeriesData,
    series: ChartKitWidgetSeries | undefined,
): PointActionParams {
    return Object.assign(
        {},
        get(series, 'custom.actionParams', {}),
        get(point, 'custom.actionParams', {}),
    );
}

export function isPointSelected(
    point: ChartKitWidgetSeriesData,
    series: ChartKitWidgetSeries | undefined,
    actionParams: StringParams = {},
) {
    return hasMatchedActionParams(getPointActionParams(point, series), actionParams);
}

export function setPointSelectState(args: {
    point: ChartKitWidgetSeriesData;
    series: ChartKitWidgetSeries;
    selected: boolean;
}) {
    const {point, series, selected} = args;
    const opacity = selected ? Opacity.SELECTED : Opacity.UNSELECTED;

    switch (series.type) {
        case 'line':
        case 'area': {
            if (selected) {
                set(point, 'marker', {
                    states: {normal: {enabled: true}},
                });
            }
            break;
        }
        default: {
            set(point, 'opacity', opacity);
        }
    }
}

export function setSeriesSelectState(args: {series: ChartKitWidgetSeries; selected: boolean}) {
    const {series, selected} = args;
    const opacity = selected ? Opacity.SELECTED : Opacity.UNSELECTED;

    switch (series.type) {
        case 'area':
        case 'line': {
            set(series, 'opacity', opacity);
            break;
        }
        default: {
            break;
        }
    }
}

export function getCustomShapeRenderer(fn: (this: unknown, ...args: unknown[]) => string) {
    return function renderer(this: unknown, ...args: unknown[]) {
        const content = fn.call(this, args);

        const container = document.createElementNS(SVG_NAMESPACE_URI, 'g');
        container.innerHTML = content;

        return container;
    };
}
