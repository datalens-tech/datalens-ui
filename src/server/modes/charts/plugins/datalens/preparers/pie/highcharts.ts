import {PlaceholderId, getFakeTitleOrTitle} from '../../../../../../../shared';
import {getGradientStops} from '../../utils/color-helpers';
import {isLegendEnabled} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

import preparePieData from './prepare-pie-data';
import {isColoringByMeasure} from './utils';

export function prepareHighchartsPie(args: PrepareFunctionArgs) {
    const {ChartEditor, colorsConfig, labels, shared, placeholders} = args;
    const {graphs, totals, measure, label} = preparePieData(args);

    const labelsLength = labels && labels.length;
    const isHideLabel = measure?.hideLabelMode === 'hide';

    const customConfig: Record<string, any> = {
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: Boolean(labelsLength && label && !isHideLabel),
                },
            },
        },
    };

    const pie = graphs[0];

    if (pie && pie.data) {
        const colorField = placeholders.find((p) => p.id === PlaceholderId.Colors)?.items[0];

        if (isColoringByMeasure(args)) {
            pie.showInLegend = false;

            const colorValues = pie.data.map((point) => Number(point.colorValue));
            const points = pie.data as unknown as Highcharts.PointOptionsObject[];

            const minColorValue = Math.min(...colorValues);
            const maxColorValue = Math.max(...colorValues);

            customConfig.colorAxis = {
                startOnTick: false,
                endOnTick: false,
                min: minColorValue,
                max: maxColorValue,
                stops: getGradientStops(colorsConfig, points, minColorValue, maxColorValue),
            };

            customConfig.legend = {
                title: {
                    text: getFakeTitleOrTitle(colorField),
                },
                enabled: isLegendEnabled(shared.extraSettings),
                symbolWidth: null,
            };
        }
    }

    ChartEditor.updateHighchartsConfig(customConfig);

    return {graphs, totals};
}
