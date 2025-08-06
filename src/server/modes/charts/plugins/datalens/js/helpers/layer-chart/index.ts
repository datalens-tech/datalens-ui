import type {LayerChartMeta} from '../../../preparers/types';

import type {ExtendCombinedChartGraphsArgs} from './types';

export const extendCombinedChartGraphs = (args: ExtendCombinedChartGraphsArgs) => {
    const {graphs, layer, layers, legendValues} = args;
    const charType = layer.id;
    const layerSettingsLayerId = layer.layerSettings.id;

    graphs.forEach((graph) => {
        graph.type = charType;
        graph.id = `${graph.id || graph.title}__${layerSettingsLayerId}`;

        if (graph.colorGuid) {
            const legendColorValueId = `${graph.colorGuid}__${graph.legendTitle}__${graph.shapeGuid}`;
            if (layers.length > 1) {
                graph.title = `${graph.measureFieldTitle}: ${graph.title}`;
            }
            if (legendValues[legendColorValueId]) {
                graph.id = legendValues[legendColorValueId];
                graph.showInLegend = false;
            } else {
                legendValues[legendColorValueId] = graph.id;
            }
        }

        switch (charType) {
            case 'line':
                {
                    const placeholders = layer.placeholders;
                    const hasItemsInYPlaceholder = placeholders[1].items.length;
                    const hasItemsInY2Placeholder = placeholders[2].items.length;

                    if (!hasItemsInYPlaceholder && hasItemsInY2Placeholder && layers.length > 1) {
                        graph.yAxis = 1;
                    }
                }
                break;
            case 'column':
                graph.stack = `${layerSettingsLayerId}__${graph.stack || ''}`;
                break;
            case 'area':
                graph.stack = layerSettingsLayerId;
                break;
            default:
                break;
        }
    });
};

const isChartWithoutData = (graph: {data: any[]}) => {
    const uniqueData = new Set(graph.data || []);

    const isNullChart = uniqueData.size === 1 && uniqueData.has(null);
    const isEmptyChart = uniqueData.size === 0;
    return isNullChart || isEmptyChart;
};

export const mergeResultForCombinedCharts = (
    result: {graphs: any[]; categories_ms?: number[]; categories?: number[]}[],
) => {
    if (result.length === 0) {
        return [];
    }

    const [firstChart, ...restData] = result;

    const combinedChartResult = firstChart;

    restData.forEach((item) => {
        combinedChartResult.graphs.push(...item.graphs);
    });

    if (!combinedChartResult.graphs.length) {
        return combinedChartResult;
    }

    const hasOneGraphWithData = combinedChartResult.graphs.some((graph) => {
        return !isChartWithoutData(graph);
    });

    if (hasOneGraphWithData && isChartWithoutData(combinedChartResult.graphs[0])) {
        delete combinedChartResult.categories_ms;
    }

    combinedChartResult.graphs = combinedChartResult.graphs.filter(
        (graph: {data: any[]}, index) => {
            if (hasOneGraphWithData) {
                return !isChartWithoutData(graph);
            }

            return !(isChartWithoutData(graph) && index !== 0);
        },
    );

    return combinedChartResult;
};

export const getLayerChartMeta = ({isComboChart}: {isComboChart: boolean}): LayerChartMeta => {
    const layerChartsMeta: LayerChartMeta = {};

    if (isComboChart) {
        layerChartsMeta.isCategoriesSortAvailable = true;
    }

    return layerChartsMeta;
};
