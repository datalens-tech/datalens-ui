import type {
    ChartKitWidgetData,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {ServerField, getFakeTitleOrTitle} from '../../../../../../../shared';
import {PointCustomData, ScatterSeriesCustomData} from '../../../../../../../shared/types/chartkit';
import {getAxisType} from '../helpers/axis';
import {PrepareFunctionArgs} from '../types';

import {ScatterGraph, prepareScatter} from './prepareScatter';

type MapScatterSeriesArgs = {
    x?: ServerField;
    y?: ServerField;
    graph: ScatterGraph;
};

function mapScatterSeries(args: MapScatterSeriesArgs): ScatterSeries<PointCustomData> {
    const {x, y, graph} = args;

    return {
        type: 'scatter',
        name: graph.name || '',
        color: typeof graph.color === 'string' ? graph.color : undefined,
        data:
            graph.data?.map((item, index) => {
                const point = item;
                const pointData: ScatterSeriesData<PointCustomData> = {
                    radius: point.marker?.radius,
                    custom: {
                        name: point.name,
                        xLabel: point.xLabel,
                        yLabel: point.yLabel,
                        cLabel: point.cLabel,
                        sLabel: point.sLabel,
                        sizeLabel: point.sizeLabel,
                    },
                };

                if (getAxisType(x) === 'category') {
                    pointData.x = typeof item.x === 'number' ? item.x : index;
                } else {
                    pointData.x = item.x;
                }

                if (getAxisType(y) === 'category') {
                    pointData.y = typeof item.y === 'number' ? item.y : index;
                } else {
                    pointData.y = item.y;
                }

                return pointData;
            }) || [],
    };
}

export function prepareD3Scatter(
    options: PrepareFunctionArgs,
): ChartKitWidgetData<PointCustomData> {
    const {categories: preparedXCategories, graphs, x, y, z, color, size} = prepareScatter(options);
    const xCategories = (preparedXCategories || []).map(String);
    const seriesCustomData: ScatterSeriesCustomData = {
        xTitle: getFakeTitleOrTitle(x),
        yTitle: getFakeTitleOrTitle(y),
        pointTitle: getFakeTitleOrTitle(z),
        colorTitle: getFakeTitleOrTitle(color),
        sizeTitle: getFakeTitleOrTitle(size),
    };

    const config: ChartKitWidgetData = {
        series: {
            data: graphs.map((graph) => ({
                ...mapScatterSeries({graph, x, y}),
                custom: seriesCustomData,
            })),
        },
    };

    if (getAxisType(x) === 'category') {
        config.xAxis = {
            categories: xCategories,
        };
    }

    if (config.series.data.length <= 1) {
        config.legend = {enabled: false};
    }

    return config;
}
