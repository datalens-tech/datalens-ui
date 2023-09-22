import React from 'react';

import type {
    ScatterSeries,
    ScatterSeriesData,
    TooltipHoveredData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {PointCustomData, ScatterSeriesCustomData} from '../../../../../shared/types/chartkit';

type CustomScatterSeries = ScatterSeries<PointCustomData> & {custom: ScatterSeriesCustomData};

export function scatterTooltipRenderer(data: {hovered: TooltipHoveredData}) {
    const series = data.hovered.series as CustomScatterSeries;
    const point = data.hovered.data as ScatterSeriesData<PointCustomData>;
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
}

export function tooltipRenderer(data: {hovered: TooltipHoveredData}) {
    switch (data.hovered.series.type) {
        case 'scatter': {
            return scatterTooltipRenderer(data);
        }
        default: {
            return undefined;
        }
    }
}
