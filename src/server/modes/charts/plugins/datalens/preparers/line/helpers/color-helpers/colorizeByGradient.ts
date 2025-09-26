import type {ExtendedSeriesLineOptions} from '../../../../../../../../../shared';
import {WizardVisualizationId} from '../../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../../types';
import {mapAndColorizeGraphsByGradient} from '../../../../utils/color-helpers';

import type {ColorizeByGradientOptions} from './types';

const colorizeColumnAndBarGraphs = (
    graphs: ExtendedSeriesLineOptions[],
    colorsConfig: ChartColorsConfig,
) => {
    mapAndColorizeGraphsByGradient(graphs, colorsConfig);
};

export const colorizeByGradient = (
    visualizationId: WizardVisualizationId,
    options: ColorizeByGradientOptions,
) => {
    switch (visualizationId) {
        case WizardVisualizationId.Column:
        case WizardVisualizationId.Column100p:
        case WizardVisualizationId.BarXD3:
        case WizardVisualizationId.Bar:
        case WizardVisualizationId.Bar100p:
        case WizardVisualizationId.BarYD3:
        case WizardVisualizationId.BarY100pD3: {
            colorizeColumnAndBarGraphs(options.graphs, options.colorsConfig);
        }
    }
};
