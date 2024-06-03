import type {VisualizationWithLayersShared} from 'shared';
import {createVisualizationLayer} from 'units/wizard/utils/wizard';

export const COMBINED_CHART_VISUALIZATION: VisualizationWithLayersShared['visualization'] = {
    id: 'combined-chart',
    highchartsId: 'column',
    type: 'geo',
    name: 'label_visualization-combined-chart',
    iconProps: {id: 'visCombined', width: '24'},
    layers: [createVisualizationLayer('line')],
    selectedLayerId: '',
    placeholders: [],
};
