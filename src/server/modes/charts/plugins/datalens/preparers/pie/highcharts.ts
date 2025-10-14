import set from 'lodash/set';

import {getFakeTitleOrTitle, isHtmlField} from '../../../../../../../shared';
import {getHighchartsGradientStops} from '../../utils/get-gradient-stops';
import {isLegendEnabled} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

import preparePieData from './prepare-pie-data';
import {isColoringByMeasure} from './utils';

export function prepareHighchartsPie(args: PrepareFunctionArgs) {
    const {ChartEditor, colorsConfig, labels, shared} = args;
    const {graphs, totals, measure, label, color, dimension} = preparePieData(args);

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
                stops: getHighchartsGradientStops({
                    colorsConfig,
                    points,
                    minColorValue,
                    maxColorValue,
                }),
            };

            customConfig.legend = {
                title: {
                    text: getFakeTitleOrTitle(color),
                },
                enabled: isLegendEnabled(shared.extraSettings),
                symbolWidth: null,
            };
        }
    }

    const shouldUseHtmlForLegend = [dimension, color].some(isHtmlField);
    if (shouldUseHtmlForLegend) {
        set(customConfig, 'legend.useHTML', true);
    }

    ChartEditor.updateHighchartsConfig(customConfig);

    return {graphs, totals};
}
