import type {
    ChartData,
    ChartSeries,
    LineSeries,
    LineSeriesData,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {
    SeriesExportSettings,
    ServerField,
    WrappedHTML,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    AxisMode,
    PlaceholderId,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
} from '../../../../../../../shared';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFormattedLabel} from '../../gravity-charts/utils/dataLabels';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisType} from '../helpers/axis';
import type {PrepareFunctionArgs} from '../types';

import {prepareLineData} from './prepare-line-data';

type ExtendedLineSeriesData = Omit<LineSeriesData, 'x'> & {
    x?: LineSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type ExtendedLineSeries = Omit<LineSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedLineSeriesData[];
};

export function prepareD3Line(args: PrepareFunctionArgs) {
    const {
        labels,
        placeholders,
        disableDefaultSorting = false,
        shared,
        idToDataType,
        colors,
        shapes,
    } = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yFields = yPlaceholder?.items || [];
    const labelField = labels?.[0];
    const isDataLabelsEnabled = Boolean(labelField);
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig}) ?? AxisMode.Discrete;
    const isCategoriesXAxis =
        !xField ||
        getAxisType({
            field: xField,
            settings: xPlaceholder?.settings,
            axisMode: xAxisMode,
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

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: 'x', field: xField}),
            getExportColumnSettings({path: 'y', field: yFields[0]}),
        ],
    };

    const colorItem = colors[0];
    if (colorItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'series.custom.colorValue', field: colorItem}),
        );
    }

    const shapeItem = shapes[0];
    if (shapeItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'series.custom.shapeValue', field: shapeItem}),
        );
    }

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);

    const seriesData: ExtendedLineSeries[] = preparedData.graphs.map<LineSeries>((graph: any) => {
        return {
            name: graph.title,
            type: 'line',
            color: graph.color,
            data: graph.data.reduce((acc: ExtendedLineSeriesData[], item: any, index: number) => {
                const dataItem: ExtendedLineSeriesData = {
                    y: item?.y || 0,
                    custom: item.custom,
                };

                if (isDataLabelsEnabled) {
                    if (item?.y === null) {
                        dataItem.label = '';
                    } else if (shouldUseHtmlForLabels) {
                        dataItem.label = item?.label;
                    } else {
                        dataItem.label = getFormattedLabel(item?.label, labelField);
                    }
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
                html: shouldUseHtmlForLabels,
            },
            legend: {
                symbol: {
                    width: 36,
                },
            },
            dashStyle: graph.dashStyle,
            custom: {
                ...graph.custom,
                exportSettings,
                colorValue: graph.colorValue,
                shapeValue: graph.shapeValue,
            },
        };
    });

    let legend: ChartData['legend'];
    if (seriesData.length <= 1) {
        legend = {enabled: false};
    }

    let xAxis: ChartData['xAxis'] = {};
    if (isCategoriesXAxis) {
        xAxis = {
            type: 'category',
            categories: xCategories?.map(String),
        };
    } else {
        if (isDateField(xField)) {
            xAxis.type = 'datetime';
        }

        if (isNumberField(xField)) {
            xAxis.type = xPlaceholder?.settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';
        }
    }

    const config: ChartData = {
        series: {
            data: seriesData as ChartSeries[],
        },
        xAxis,
        legend,
    };

    if (yFields[0]) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yFields[0]}),
        };
    }

    return merge(getBaseChartConfig(shared), config);
}
