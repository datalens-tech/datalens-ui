import React from 'react';

import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {
    ChartKitWidgetTooltip,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import type {PointCustomData, ScatterSeriesCustomData} from '../../../../../shared/types/chartkit';

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

export const getTooltipRenderer = (widgetData: ChartKitWidgetData): TooltipRenderer | undefined => {
    const seriesTypes = (widgetData?.series?.data || []).map((s) => s.type);

    if (seriesTypes.length === 1) {
        switch (seriesTypes[0]) {
            case 'scatter': {
                return (data: Parameters<TooltipRenderer>[0]) =>
                    scatterTooltipRenderer(widgetData, data);
            }
            default: {
                return undefined;
            }
        }
    }

    return undefined;
};
