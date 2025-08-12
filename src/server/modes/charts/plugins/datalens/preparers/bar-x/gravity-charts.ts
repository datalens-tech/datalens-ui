import type {
    BarXSeries,
    BarXSeriesData,
    ChartData,
    ChartSeries,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings, ServerField, WrappedMarkdown} from '../../../../../../../shared';
import {
    AxisMode,
    LabelsPositions,
    PlaceholderId,
    getFakeTitleOrTitle,
    getXAxisMode,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isNumberField,
} from '../../../../../../../shared';
import type {WrappedHTML} from '../../../../../../../shared/types/charts';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFormattedLabel} from '../../gravity-charts/utils/dataLabels';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {getAxisType} from '../helpers/axis';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarX} from './prepare-bar-x';

type OldBarXDataItem = {
    y: number;
    x?: number;
    label?: string | number;
    custom?: any;
} | null;

type ExtendedBaXrSeriesData = Omit<BarXSeriesData, 'x'> & {
    x?: BarXSeriesData['x'] | WrappedHTML | WrappedMarkdown;
};

type ExtendedBarXSeries = Omit<BarXSeries, 'data'> & {
    custom?: {
        exportSettings?: SeriesExportSettings;
        colorValue?: string;
    };
    data: ExtendedBaXrSeriesData[];
};

export function prepareD3BarX(args: PrepareFunctionArgs) {
    const {
        shared,
        labels,
        placeholders,
        disableDefaultSorting = false,
        idToDataType,
        colors,
    } = args;
    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField: ServerField | undefined = xPlaceholder?.items?.[0];
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const yField: ServerField | undefined = yPlaceholder?.items?.[0];
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

    if (!xField && !yField) {
        return {
            series: {
                data: [],
            },
        };
    }

    const preparedData = prepareBarX(args);
    const xCategories = xField
        ? preparedData.categories
        : yField
          ? [getFakeTitleOrTitle(yField)]
          : [];

    const exportSettings: SeriesExportSettings = {
        columns: [
            getExportColumnSettings({path: isCategoriesXAxis ? 'category' : 'x', field: xField}),
            getExportColumnSettings({path: 'y', field: yField}),
        ],
    };

    const colorItem = colors[0];
    if (colorItem) {
        exportSettings.columns.push(
            getExportColumnSettings({path: 'series.custom.colorValue', field: colorItem}),
        );
    }

    const shouldUseHtmlForLabels =
        isMarkupField(labelField) || isHtmlField(labelField) || isMarkdownField(labelField);

    const seriesData = preparedData.graphs.map<ExtendedBarXSeries>((graph) => {
        return {
            name: graph.title,
            type: 'bar-x',
            color: graph.color,
            stackId: graph.stack,
            stacking: 'normal',
            data: graph.data.reduce(
                (acc: ExtendedBaXrSeriesData[], item: OldBarXDataItem, index: number) => {
                    const dataItem: ExtendedBaXrSeriesData = {
                        y: item?.y || 0,
                        custom: item?.custom,
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
                },
                [],
            ),
            custom: {...graph.custom, colorValue: graph.colorValue, exportSettings},
            dataLabels: {
                enabled: isDataLabelsEnabled,
                inside: shared.extraSettings?.labelsPosition !== LabelsPositions.Outside,
                html: shouldUseHtmlForLabels,
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
        legend,
        xAxis,
    };

    if (yField) {
        config.tooltip = {
            valueFormat: getFieldFormatOptions({field: yField}),
        };
    }

    return merge(getBaseChartConfig(shared), config);
}
