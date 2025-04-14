import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import type {ChartKitWidgetSeries} from '@gravity-ui/chartkit/build/types/widget-data/series';
import get from 'lodash/get';
import type {ColumnExportSettings, SeriesExportSettings, TableRow} from 'shared';
import type {TableData} from 'ui/libs/DatalensChartkit/types';

type ChartToTableArgs = {
    chartData?: ChartKitWidgetData;
};

function getSeriesDataForExport(series: ChartKitWidgetSeries) {
    switch (series.type) {
        case 'treemap': {
            // Only the leaves of the tree are involved in the export
            return series.data.filter((d) => d.value);
        }
        default: {
            return series.data;
        }
    }
}

function getDefaultExportSettings(series: ChartKitWidgetSeries): SeriesExportSettings {
    const point = series.data?.[0];
    const pointFields = Object.keys(point).map((key) => {
        return {
            field: key,
            name: key,
        };
    });

    return {
        columns: [
            {
                field: 'series.name',
                name: 'name',
            },
            ...pointFields,
        ],
    };
}

export function chartToTable(args: ChartToTableArgs): TableData | null {
    const {chartData} = args;

    if (!chartData) {
        return null;
    }

    const rows: TableData['rows'] = [];

    const columns = new Map<string, ColumnExportSettings>();
    chartData.series.data.forEach((s) => {
        const exportSettings: SeriesExportSettings = get(
            s,
            'custom.exportSettings',
            getDefaultExportSettings(s),
        );

        exportSettings?.columns.forEach((col) => {
            columns.set(col.field, col);
        });
    });

    if (!columns.size) {
        return null;
    }

    const head = Array.from(columns.entries()).map(([key, value]) => ({
        id: key,
        name: value.name,
        formatter: value.formatter,
        type: value.type,
    })) as TableData['head'];

    chartData.series.data.forEach((s) => {
        const points = getSeriesDataForExport(s);
        points.forEach((d) => {
            const row: TableRow = {cells: []};

            columns.forEach((col) => {
                let value = '';
                if (col.field.startsWith('series.')) {
                    const fieldPath = col.field.replace('series.', '');
                    value = get(s, fieldPath);
                } else if (col.field === 'category') {
                    let index;
                    let categories;

                    if (chartData.xAxis?.categories?.length) {
                        categories = chartData.xAxis?.categories ?? [];
                        index = get(d, 'x', -1);
                    } else {
                        const yAxes = Array.isArray(chartData.yAxis)
                            ? chartData.yAxis
                            : [chartData.yAxis];
                        categories =
                            yAxes.reduce<string[]>((acc, axis) => {
                                return axis?.categories ? [...acc, ...axis.categories] : acc;
                            }, []) ?? [];
                        index = get(d, 'y', -1);
                    }
                    value = categories[index] ?? '';
                } else {
                    const fieldPath = col.field;
                    value = get(d, fieldPath, '');
                }

                row.cells.push({value});
            });

            rows.push(row);
        });
    });

    return {
        head,
        rows,
    };
}
