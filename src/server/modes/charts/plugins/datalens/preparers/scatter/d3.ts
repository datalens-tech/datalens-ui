import type {
    ChartKitWidgetData,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {PlaceholderId, getFakeTitleOrTitle, getXAxisMode} from '../../../../../../../shared';
import type {
    PointCustomData,
    ScatterSeriesCustomData,
} from '../../../../../../../shared/types/chartkit';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getAxisType} from '../helpers/axis';
import type {PrepareFunctionArgs} from '../types';

import type {ScatterGraph} from './prepare-scatter';
import {prepareScatter} from './prepare-scatter';

type MapScatterSeriesArgs = {
    xAxisType?: string;
    yAxisType?: string;
    graph: ScatterGraph;
};

function mapScatterSeries(args: MapScatterSeriesArgs): ScatterSeries<PointCustomData> {
    const {xAxisType, yAxisType, graph} = args;

    const series = {
        type: 'scatter',
        name: graph.name || '',
        color: typeof graph.color === 'string' ? graph.color : undefined,
        data:
            graph.data?.map((item, index) => {
                const point = item;
                const pointData: ScatterSeriesData<PointCustomData> = {
                    radius: point.marker?.radius,
                    custom: {
                        ...item.custom,
                        name: point.name,
                        xLabel: point.xLabel,
                        yLabel: point.yLabel,
                        cLabel: point.cLabel,
                        sLabel: point.sLabel,
                        sizeLabel: point.sizeLabel,
                    },
                };

                if (xAxisType === 'category') {
                    pointData.x = typeof item.x === 'number' ? item.x : index;
                } else {
                    pointData.x = item.x;
                }

                if (yAxisType === 'category') {
                    pointData.y = typeof item.y === 'number' ? item.y : index;
                } else {
                    pointData.y = item.y;
                }

                return pointData;
            }) || [],
        // @ts-ignore
        custom: graph.custom,
    } as ScatterSeries<PointCustomData>;

    if (graph.marker?.symbol) {
        series.symbolType = graph.marker?.symbol as ScatterSeries['symbolType'];
    }

    return series;
}

export function prepareD3Scatter(args: PrepareFunctionArgs): ChartKitWidgetData<PointCustomData> {
    const {shared, idToDataType, placeholders} = args;
    const {categories: preparedXCategories, graphs, x, y, z, color, size} = prepareScatter(args);
    const xCategories = (preparedXCategories || []).map(String);
    const seriesCustomData: ScatterSeriesCustomData = {
        xTitle: getFakeTitleOrTitle(x),
        yTitle: getFakeTitleOrTitle(y),
        pointTitle: getFakeTitleOrTitle(z),
        colorTitle: getFakeTitleOrTitle(color),
        sizeTitle: getFakeTitleOrTitle(size),
    };

    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig});
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xAxisType = getAxisType({
        field: x,
        settings: xPlaceholder?.settings,
        axisMode: xAxisMode,
    });
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yAxisType = getAxisType({
        field: y,
        settings: yPlaceholder?.settings,
    });
    const config: ChartKitWidgetData = {
        series: {
            data: graphs.map((graph) => ({
                ...mapScatterSeries({graph, xAxisType, yAxisType}),
                custom: seriesCustomData,
            })),
        },
    };

    if (xAxisType === 'category') {
        config.xAxis = {
            categories: xCategories,
        };
    }

    if (config.series.data.length <= 1) {
        config.legend = {enabled: false};
    }

    return config;
}
