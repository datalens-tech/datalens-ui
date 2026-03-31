import type {ChartData, ChartSeries} from '@gravity-ui/chartkit/gravity-charts';
import get from 'lodash/get';
import type {ColumnExportSettings, SeriesExportSettings, TableCellsRow} from 'shared';
import type {TableData} from 'ui/libs/DatalensChartkit/types';

type ChartToTableArgs = {
    chartData?: ChartData;
    dateFormat?: string;
};

function getSeriesDataForExport(series: ChartSeries) {
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

function getDefaultExportSettings(series: ChartSeries): SeriesExportSettings {
    const point = series.data?.[0];
    const pointFields = Object.keys(point).map((key) => {
        return {
            id: key,
            field: key,
            name: key,
        };
    });

    return {
        columns: [
            {
                id: 'series.name',
                field: 'series.name',
                name: 'name',
            },
            ...pointFields,
        ],
    };
}

export function chartToTable(args: ChartToTableArgs): TableData | null {
    const {chartData, dateFormat} = args;

    if (!chartData) {
        return null;
    }

    const series = chartData.series.data;
    const columns = new Map<string, ColumnExportSettings & {index: number}>();
    series.forEach((s) => {
        const exportSettings: SeriesExportSettings = get(
            s,
            'custom.exportSettings',
            getDefaultExportSettings(s),
        );

        exportSettings?.columns.forEach((col) => {
            if (!columns.has(col.id)) {
                columns.set(col.id, {...col, index: columns.size});
            }
        });
    });

    if (!columns.size) {
        return null;
    }

    const head = Array.from(columns.entries()).map(([key, value]) => ({
        id: key,
        name: value.name,
        formatter: value.formatter,
        format: value.type === 'date' && dateFormat ? dateFormat : value.format,
        type: value.type,
    })) as TableData['head'];

    // The series should be grouped by the first field, so that rows with the same x values are not duplicated in the table.
    // Series with different names make up columns such as x, name1, name2, ..., nameD
    const shouldMergeSeries = series.every((s) => ['line', 'bar-x', 'area'].includes(s.type));

    const rows = new Map<number, TableCellsRow>();
    series.forEach((s, seriesIndex) => {
        const points = getSeriesDataForExport(s);
        points.forEach((d, pointIndex) => {
            const key = shouldMergeSeries ? get(d, 'x') : `${seriesIndex}_${pointIndex}`;
            const row: TableCellsRow = rows.get(key) ?? {
                cells: new Array(columns.size).fill(null).map(() => ({value: ''})),
            };

            const exportSettings: SeriesExportSettings = get(
                s,
                'custom.exportSettings',
                getDefaultExportSettings(s),
            );

            exportSettings?.columns.forEach((col) => {
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

                const column = columns.get(col.id);
                const cellIndex = column?.index ?? 0;

                row.cells[cellIndex] = {value};
            });

            rows.set(key, row);
        });
    });

    return {
        head,
        rows: Array.from(rows.values()),
    };
}
