import {getFakeTitleOrTitle, isNumberField} from '../../../../../../../shared';
import {getGradientStops} from '../../utils/color-helpers';

import preparePie from './preparePie';

export function prepareHighchartsPie(args: any) {
    const {ChartEditor, colorsConfig, labels, shared, placeholders} = args;
    const {graphs, categories, totals, measure, label} = preparePie(args);

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
        const color = placeholders[0].items[0];

        const isColoringByMeasure = color.type === 'MEASURE' && isNumberField(color);

        const isLegendEnabled = shared.extraSettings?.legendMode !== 'hide';

        if (isColoringByMeasure) {
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
                    text: getFakeTitleOrTitle(color),
                },
                enabled: isLegendEnabled,
                symbolWidth: null,
            };
        }
    }

    ChartEditor.updateHighchartsConfig(customConfig);

    return {graphs, categories, totals};
}
