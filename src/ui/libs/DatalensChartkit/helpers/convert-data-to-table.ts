import {dateTime} from '@gravity-ui/date-utils';

import {prepareValues} from '../modules/export/export';
import type {LoadedWidgetData} from '../types';

const DAY_MS = 1000 * 60 * 60 * 24;

type ConvertChartToTableArgs = {
    widget: any;
    widgetData: LoadedWidgetData;
};

type ChartData = {
    categories_ms: number[];
    categories?: string[];
    graphs: any[];
};

export function convertChartToTable(options: ConvertChartToTableArgs) {
    const {widget, widgetData} = options;
    const chartData = prepareValues({
        widget,
        data: widgetData?.data,
        widgetType: widgetData?.type,
        extra: {},
    }) as ChartData;

    if (!chartData) {
        return [];
    }

    let lines = [];
    const header = [];

    if (chartData.categories_ms) {
        header.push('DateTime');
    }

    if (chartData.categories) {
        header.push('Categories');
    }

    chartData.graphs.forEach((graph) => {
        header.push(graph.title);
    });

    lines.push(header);

    const dataArray =
        chartData.categories_ms ||
        chartData.categories ||
        Array(chartData.graphs[0].data.length).fill(undefined);

    dataArray.forEach((item, i) => {
        const line = [];

        if (item) {
            const diff = item - dataArray[i - 1] || dataArray[i + 1] - item;
            const format = diff < DAY_MS ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
            const measure = chartData.categories_ms
                ? dateTime({
                      input: item,
                  }).format(format)
                : item;
            line.push(`"${measure}"`);
        }

        chartData.graphs.forEach((graph) => {
            let currentValue = graph.data[i];
            let value = '""';

            if (currentValue || currentValue === 0) {
                if (graph.type === 'diff' && Array.isArray(currentValue)) {
                    currentValue = currentValue[0];
                }
                value = String(currentValue);

                if (typeof currentValue === 'number') {
                    value = value.replace('.', ',');
                }
            }

            line.push(value);
        });

        lines.push(line);
    });

    lines = lines.map((line) => {
        return line.join(';');
    });

    return lines;
}
