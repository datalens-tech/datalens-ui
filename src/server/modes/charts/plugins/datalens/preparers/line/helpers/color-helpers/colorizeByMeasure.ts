import {ExtendedSeriesLineOptions, WizardVisualizationId} from '../../../../../../../../../shared';
import {ChartColorsConfig} from '../../../../js/helpers/colors';
import {mapAndColorizeGraphsByMeasure} from '../../../../utils/color-helpers';

import {ColorizeByMeasureOptions} from './types';

const colorizeColumnAndBarGraphs = (
    graphs: ExtendedSeriesLineOptions[],
    colorsConfig: ChartColorsConfig,
) => {
    mapAndColorizeGraphsByMeasure(graphs, colorsConfig);
};

export const colorizeByMeasure = (
    visualizationId: WizardVisualizationId,
    options: ColorizeByMeasureOptions,
) => {
    switch (visualizationId) {
        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p:
        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p: {
            colorizeColumnAndBarGraphs(options.graphs, options.colorsConfig);
        }
    }
};
