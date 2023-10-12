import React from 'react';

import type {
    ChartKitWidgetTooltip,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {PointCustomData, ScatterSeriesCustomData} from '../../../../../shared/types/chartkit';

type CustomScatterSeries = ScatterSeries<PointCustomData> & {custom: ScatterSeriesCustomData};
type TooltipRenderer = NonNullable<ChartKitWidgetTooltip['renderer']>;

export const scatterTooltipRenderer: TooltipRenderer = (data) => {
    const series = data.hovered[0].series as CustomScatterSeries | undefined;
    const point = data.hovered[0].data as ScatterSeriesData<PointCustomData> | undefined;

    if (!series || !point) {
        return null;
    }

    const {pointTitle, xTitle, yTitle, colorTitle, shapeTitle, sizeTitle} = series.custom || {};
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

export const tooltipRenderer = (data: Parameters<TooltipRenderer>[0]) => {
    switch (data.hovered[0].series.type) {
        case 'scatter': {
            return scatterTooltipRenderer(data);
        }
        default: {
            return undefined;
        }
    }
};
