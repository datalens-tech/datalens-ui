import type {BarYSeries, ChartKitWidgetData} from '@gravity-ui/chartkit/build/types/widget-data';

import {WizardVisualizationId} from '../../../../../../../shared';
import type {PrepareFunctionArgs} from '../types';

import {prepareBarYData} from './prepare-bar-y-data';

type BarYPoint = {x: number; y: number} & Record<string, unknown>;

export function prepareD3BarY(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {visualizationId} = args;
    const {graphs, categories} = prepareBarYData(args);
    const hasCategories = Boolean(categories?.length);
    const series = graphs.map<BarYSeries>((graph) => {
        return {
            ...graph,
            type: 'bar-y',
            stacking: visualizationId === WizardVisualizationId.BarY100pD3 ? 'percent' : 'normal',
            name: graph.title,
            data: graph.data
                .filter((d: unknown) => d !== null)
                .map((d: BarYPoint) => {
                    const {x, y, ...other} = d;

                    return {y: x, x: y, ...other};
                }),
            dataLabels: {
                enabled: graph.dataLabels?.enabled,
                inside: visualizationId === WizardVisualizationId.BarY100pD3,
            },
        } as BarYSeries;
    });

    const config: ChartKitWidgetData = {
        series: {
            data: series.filter((s) => s.data.length),
        },
        xAxis: {
            min: 0,
        },
    };

    if (hasCategories) {
        config.yAxis = [
            {
                type: 'category',
                categories: categories as string[],
            },
        ];
    }

    return config;
}
