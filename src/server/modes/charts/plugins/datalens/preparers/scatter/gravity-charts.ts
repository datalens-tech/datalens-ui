import type {
    ChartData,
    ScatterSeries,
    ScatterSeriesData,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings} from '../../../../../../../shared';
import {
    PlaceholderId,
    getFakeTitleOrTitle,
    getXAxisMode,
    isDateField,
    isNumberField,
} from '../../../../../../../shared';
import type {
    PointCustomData,
    ScatterSeriesCustomData,
} from '../../../../../../../shared/types/chartkit';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {isGradientMode} from '../../utils/misc-helpers';
import {getAxisFormatting, getAxisType} from '../helpers/axis';
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
                    color: typeof point.color === 'string' ? point.color : undefined,
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

// eslint-disable-next-line complexity
export function prepareD3Scatter(args: PrepareFunctionArgs): ChartData<PointCustomData> {
    const {shared, idToDataType, placeholders, colors, colorsConfig, shapes, visualizationId} =
        args;
    const {categories: preparedXCategories, graphs, x, y, z, color, size} = prepareScatter(args);
    const xCategories = (preparedXCategories || []).map(String);

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: 'x', field: x}),
            getExportColumnSettings({path: 'y', field: y}),
        ],
    };

    if (z) {
        exportSettings.columns.push(getExportColumnSettings({path: 'custom.name', field: z}));
    }

    if (size) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'custom.sizeLabel', field: size}),
        );
    }

    const colorItem = colors[0];
    if (colorItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'custom.cLabel', field: colorItem}),
        );
    }

    const shapeItem = shapes[0];
    if (shapeItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'custom.sLabel', field: shapeItem}),
        );
    }

    const seriesCustomData: ScatterSeriesCustomData = {
        xTitle: getFakeTitleOrTitle(x),
        yTitle: getFakeTitleOrTitle(y),
        pointTitle: getFakeTitleOrTitle(z),
        colorTitle: getFakeTitleOrTitle(color),
        sizeTitle: getFakeTitleOrTitle(size),
        exportSettings,
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

    let xAxis: ChartData['xAxis'] = {};
    if (xAxisType === 'category' && xCategories?.length) {
        xAxis = {
            type: 'category',
            categories: xCategories,
        };
    } else {
        if (isDateField(x)) {
            xAxis.type = 'datetime';
        }

        if (isNumberField(x)) {
            xAxis.type = xPlaceholder?.settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';
        }

        const xAxisLabelNumberFormat = xPlaceholder
            ? getAxisFormatting({
                  placeholder: xPlaceholder,
                  visualizationId,
              })
            : undefined;

        if (xAxisLabelNumberFormat) {
            xAxis.labels = {numberFormat: xAxisLabelNumberFormat};
        }
    }

    const colorFieldDataType = color ? idToDataType[color.guid] : null;
    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    let legend: ChartData['legend'] = {};

    if (graphs.length && gradientMode) {
        legend = {
            enabled: true,
            type: 'continuous',
            title: {text: getFakeTitleOrTitle(color), style: {fontWeight: '500'}},
            colorScale: {
                colors: colorsConfig.gradientColors,
                stops: colorsConfig.gradientColors.length === 2 ? [0, 1] : [0, 0.5, 1],
            },
        };
    } else if (graphs.length <= 1) {
        legend.enabled = false;
    }

    const axisLabelNumberFormat = yPlaceholder
        ? getAxisFormatting({
              placeholder: yPlaceholder,
              visualizationId,
          })
        : undefined;

    const config: ChartData = {
        xAxis,
        yAxis: [
            {
                labels: {
                    numberFormat: axisLabelNumberFormat ?? undefined,
                },
            },
        ],
        series: {
            data: graphs.map((graph) => ({
                ...mapScatterSeries({graph, xAxisType, yAxisType}),
                custom: seriesCustomData,
            })),
        },
        legend,
    };

    return merge(getBaseChartConfig(shared), config);
}
