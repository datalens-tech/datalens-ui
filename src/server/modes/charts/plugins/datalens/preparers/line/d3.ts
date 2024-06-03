import type {
    ChartKitWidgetData,
    LineSeries,
    LineSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import type {ServerField} from '../../../../../../../shared';
import {PlaceholderId} from '../../../../../../../shared';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
import {getAxisType} from '../helpers/axis';
import {getAllVisualizationsIds} from '../helpers/visualizations';
import type {PrepareFunctionArgs} from '../types';

import {prepareLineData} from './prepare-line-data';

export function prepareD3Line(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {labels, placeholders, disableDefaultSorting = false, shared, sort} = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const labelField = labels?.[0];
    const isDataLabelsEnabled = Boolean(labelField);
    const isCategoriesXAxis =
        !xField ||
        getAxisType({
            field: xField,
            settings: xPlaceholder?.settings,
            visualizationIds: getAllVisualizationsIds(shared),
            sort,
        }) === 'category' ||
        disableDefaultSorting;

    if (!xField || !yFields.length) {
        return {
            series: {
                data: [],
            },
        };
    }

    const preparedData = prepareLineData(args);
    const xCategories = preparedData.categories;

    const seriesData: LineSeries[] = preparedData.graphs.map<LineSeries>((graph: any) => {
        return {
            name: graph.title,
            type: 'line',
            color: graph.color,
            data: graph.data.reduce((acc: LineSeriesData[], item: any, index: number) => {
                const dataItem: LineSeriesData = {
                    y: item?.y || 0,
                    custom: item.custom,
                };

                if (isDataLabelsEnabled) {
                    dataItem.label =
                        item?.y === null ? ' ' : getFormattedLabel(item?.label, labelField);
                }

                if (isCategoriesXAxis) {
                    dataItem.x = index;
                } else if (!item && xCategories) {
                    dataItem.x = xCategories[index];
                } else {
                    dataItem.x = item?.x;
                }

                acc.push(dataItem);

                return acc;
            }, []),
            dataLabels: {
                enabled: isDataLabelsEnabled,
            },
            legend: {
                symbol: {
                    width: 36,
                },
            },
            dashStyle: graph.dashStyle,
            custom: graph.custom,
        };
    });

    const config: ChartKitWidgetData = {
        series: {
            data: seriesData,
        },
    };

    if (config.series.data.length <= 1) {
        config.legend = {enabled: false};
    }

    if (isCategoriesXAxis) {
        config.xAxis = {
            type: 'category',
            categories: xCategories?.map(String),
        };
    }

    return config;
}
