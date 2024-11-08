import type {
    BarXSeries,
    BarXSeriesData,
    ChartKitWidgetData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {
    AxisMode,
    LabelsPositions,
    PlaceholderId,
    getFakeTitleOrTitle,
    getXAxisMode,
} from '../../../../../../../shared';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
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

type ExtendedBarXSeries = BarXSeries & {
    custom?: {
        exportSettings?: SeriesExportSettings;
        colorValue?: string;
    };
};

export function prepareD3BarX(args: PrepareFunctionArgs): ChartKitWidgetData {
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

    const seriesData = preparedData.graphs.map<ExtendedBarXSeries>((graph) => {
        return {
            name: graph.title,
            type: 'bar-x',
            color: graph.color,
            stackId: graph.stack,
            stacking: 'normal',
            data: graph.data.reduce(
                (acc: BarXSeriesData[], item: OldBarXDataItem, index: number) => {
                    const dataItem: BarXSeriesData = {
                        y: item?.y || 0,
                        custom: item?.custom,
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
                },
                [],
            ),
            custom: {...graph.custom, colorValue: graph.colorValue, exportSettings},
            dataLabels: {
                enabled: isDataLabelsEnabled,
                inside: shared.extraSettings?.labelsPosition !== LabelsPositions.Outside,
            },
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
