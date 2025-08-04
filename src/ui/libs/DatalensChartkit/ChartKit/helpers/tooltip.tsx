import React from 'react';

import type {
    ChartData,
    ChartTooltip,
    PieSeriesData,
    ScatterSeries,
    ScatterSeriesData,
    TreemapSeriesData,
} from '@gravity-ui/chartkit/gravity-charts';
import block from 'bem-cn-lite';
import get from 'lodash/get';
import {formatNumber} from 'shared/modules/format-units/index';

import type {PointCustomData, ScatterSeriesCustomData} from '../../../../../shared/types/chartkit';

const b = block('dl-chart-tooltip-content');

type CustomScatterSeries = ScatterSeries<PointCustomData> & {custom: ScatterSeriesCustomData};
type TooltipRenderer = NonNullable<ChartTooltip['renderer']>;

export const scatterTooltipRenderer = (
    widgetData: ChartData,
    data: Parameters<TooltipRenderer>[0],
    qa?: string,
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
        <div className={b()} data-qa={qa}>
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
        </div>
    );
};

function treemapTooltipRenderer(
    widgetData: ChartData,
    data: Parameters<TooltipRenderer>[0],
    qa?: string,
) {
    const series = widgetData.series.data[0];
    const point = data?.hovered[0]?.data as TreemapSeriesData | undefined;

    if (!series || !point) {
        return null;
    }

    const names = Array.isArray(point.name) ? point.name : [point.name];
    const label = get(point, 'label', '');

    return (
        <div className={b()} data-qa={qa}>
            {names.map((name, index) => (
                <div key={`${name}_${index}`} dangerouslySetInnerHTML={{__html: name}} />
            ))}
            <div>
                <b>{label}</b>
            </div>
        </div>
    );
}

function pieTooltipRenderer(
    _widgetData: ChartData,
    data: Parameters<TooltipRenderer>[0],
    qa?: string,
) {
    const point = data?.hovered[0]?.data as PieSeriesData | undefined;

    if (!point) {
        return null;
    }

    const value = get(point, 'formattedValue', point.value);
    let percentage = get(point, 'percentage');
    percentage = percentage ? formatNumber(percentage, {precision: 1, format: 'percent'}) : null;

    return (
        <div className={b()} data-qa={qa}>
            <div className={b('row')}>
                <div className={b('block')}>
                    <span className={b('color')} style={{backgroundColor: point.color}} />
                </div>
                <div className={b('block')}>{point.name}</div>
                <div className={b('block')}>{percentage}</div>
                <div className={b('block')}>{value}</div>
            </div>
        </div>
    );
}

function customTooltipRenderer(widgetData: ChartData, data: Parameters<TooltipRenderer>) {
    const render = widgetData?.tooltip?.renderer;
    if (typeof render !== 'function') {
        return null;
    }

    const content = render(...data);
    return <div className={b()} dangerouslySetInnerHTML={{__html: String(content ?? '')}} />;
}

export const getTooltipRenderer = ({
    widgetData,
    qa,
}: {
    widgetData: ChartData;
    qa?: string;
}): TooltipRenderer | undefined => {
    if (widgetData?.tooltip?.renderer) {
        return (...args) => customTooltipRenderer(widgetData, args);
    }

    const seriesTypes = (widgetData?.series?.data || []).map((s) => s.type);

    if (seriesTypes.length === 1) {
        switch (seriesTypes[0]) {
            case 'scatter': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    scatterTooltipRenderer(widgetData, data, qa);
            }
            case 'treemap': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    treemapTooltipRenderer(widgetData, data, qa);
            }
            case 'pie': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    pieTooltipRenderer(widgetData, data, qa);
            }
            default: {
                return undefined;
            }
        }
    }

    return undefined;
};
