import React from 'react';

import type {ChartKitWidgetData, PieSeriesData, TreemapSeriesData} from '@gravity-ui/chartkit';
import type {
    ChartKitWidgetTooltip,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {formatNumber} from 'shared/modules/format-units/index';

import type {PointCustomData, ScatterSeriesCustomData} from '../../../../../shared/types/chartkit';

const b = block('chartkit-tooltip');

type CustomScatterSeries = ScatterSeries<PointCustomData> & {custom: ScatterSeriesCustomData};
type TooltipRenderer = NonNullable<ChartKitWidgetTooltip['renderer']>;

export const scatterTooltipRenderer = (
    widgetData: ChartKitWidgetData,
    data: Parameters<TooltipRenderer>[0],
) => {
    const seriesName = data.hovered[0].series.name;
    const series = widgetData.series.data.find(
        (s) => (s as CustomScatterSeries).name === seriesName,
    );
    const point = data.hovered[0].data as ScatterSeriesData<PointCustomData> | undefined;

    if (!series || !point) {
        return null;
    }

    const {pointTitle, xTitle, yTitle, colorTitle, shapeTitle, sizeTitle} =
        (series as CustomScatterSeries).custom || {};
    const shouldShowShape = shapeTitle && shapeTitle !== colorTitle;

    return (
        <React.Fragment>
            {pointTitle && (
                <div>
                    {pointTitle}: <b>{point.custom?.name}</b>
                </div>
            )}
            <div>
                {xTitle}: {point.custom?.xLabel}
            </div>
            <div>
                {yTitle}: {point.custom?.yLabel}
            </div>
            {sizeTitle && (
                <div>
                    {sizeTitle}: {point.custom?.sizeLabel}
                </div>
            )}
            {shouldShowShape && (
                <div>
                    {shapeTitle}: {point.custom?.sLabel}
                </div>
            )}
            {colorTitle && (
                <div>
                    {colorTitle}: {point.custom?.cLabel}
                </div>
            )}
        </React.Fragment>
    );
};

function treemapTooltipRenderer(
    widgetData: ChartKitWidgetData,
    data: Parameters<TooltipRenderer>[0],
) {
    const series = widgetData.series.data[0];
    const point = data?.hovered[0]?.data as TreemapSeriesData | undefined;

    if (!series || !point) {
        return null;
    }

    const names = Array.isArray(point.name) ? point.name : [point.name];
    const label = get(point, 'label', '');

    return (
        <div className={b('content')}>
            {names.map((name, index) => (
                <div key={`${name}_${index}`} dangerouslySetInnerHTML={{__html: name}} />
            ))}
            <div>
                <b>{label}</b>
            </div>
        </div>
    );
}

function pieTooltipRenderer(_widgetData: ChartKitWidgetData, data: Parameters<TooltipRenderer>[0]) {
    const point = data?.hovered[0]?.data as PieSeriesData | undefined;

    if (!point) {
        return null;
    }

    const value = get(point, 'formattedValue', point.value);
    let percentage = get(point, 'percentage');
    percentage = percentage ? formatNumber(percentage, {precision: 1, format: 'percent'}) : null;

    return (
        <div className={b('row')}>
            <div className={b('block')}>
                <span className={b('color')} style={{backgroundColor: point.color}} />
            </div>
            <div className={b('block')}>{point.name}</div>
            <div className={b('block')}>{percentage}</div>
            <div className={b('block')}>{value}</div>
        </div>
    );
}

function customTooltipRenderer(widgetData: ChartKitWidgetData, data: Parameters<TooltipRenderer>) {
    const render = widgetData?.tooltip?.renderer;
    if (typeof render !== 'function') {
        return null;
    }

    const content = render(...data);
    return (
        <div className={b('content')} dangerouslySetInnerHTML={{__html: String(content ?? '')}} />
    );
}

export const getTooltipRenderer = (widgetData: ChartKitWidgetData): TooltipRenderer | undefined => {
    if (widgetData?.tooltip?.renderer) {
        return (...args) => customTooltipRenderer(widgetData, args);
    }

    const seriesTypes = (widgetData?.series?.data || []).map((s) => s.type);

    if (seriesTypes.length === 1) {
        switch (seriesTypes[0]) {
            case 'scatter': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    scatterTooltipRenderer(widgetData, data);
            }
            case 'treemap': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    treemapTooltipRenderer(widgetData, data);
            }
            case 'pie': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    pieTooltipRenderer(widgetData, data);
            }
            default: {
                return undefined;
            }
        }
    }

    return undefined;
};
