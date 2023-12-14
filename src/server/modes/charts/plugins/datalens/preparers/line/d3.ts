import type {
    ChartKitWidgetData,
    LineSeries,
    LineSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {PlaceholderId, ServerField} from '../../../../../../../shared';
import {getAxisType} from '../../d3/utils';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
import {PrepareFunctionArgs} from '../types';

import {getYFields} from './utils/fields';

import prepareLine from './index';

export function prepareD3Line(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {labels, placeholders, disableDefaultSorting = false} = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yFields = getYFields(placeholders);
    const labelField = labels?.[0];
    const isDataLabelsEnabled = Boolean(labelField);
    const isCategoriesXAxis =
        !xField ||
        getAxisType(xField, xPlaceholder?.settings) === 'category' ||
        disableDefaultSorting;

    if (!xField || !yFields.length) {
        return {
            series: {
                data: [],
            },
        };
    }

    const preparedData = prepareLine(args);
    const xCategories = preparedData.categories;

    const seriesData: LineSeries[] = preparedData.graphs.map<LineSeries>((graph: any) => {
        return {
            name: graph.title,
            type: 'line',
            color: graph.color,
            data: graph.data.reduce((acc: LineSeriesData[], item: any, index: number) => {
                const dataItem: LineSeriesData = {
                    y: item?.y || 0,
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
            custom: {},
            dataLabels: {
                enabled: isDataLabelsEnabled,
            },
        };
    });

    const config: ChartKitWidgetData = {
        series: {
            data: seriesData,
        },
        // @ts-ignore
        preparedData: preparedData,
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
