import type {ChartKitWidgetData} from '@gravity-ui/chartkit';
import get from 'lodash/get';
import type {ColumnExportSettings, SeriesExportSettings, TableRow} from 'shared';
import type {TableData} from 'ui/libs/DatalensChartkit/types';

type ChartToTableArgs = {
    chartData?: ChartKitWidgetData;
};

export function chartToTable(args: ChartToTableArgs): TableData | null {
    const {chartData} = args;

    if (!chartData) {
        return null;
    }

    const rows: TableData['rows'] = [];

    const columns = new Map<string, ColumnExportSettings>();
    chartData.series.data.forEach((s) => {
        const exportSettings: SeriesExportSettings = get(s, 'custom.exportSettings');

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
        s.data.forEach((d) => {
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
