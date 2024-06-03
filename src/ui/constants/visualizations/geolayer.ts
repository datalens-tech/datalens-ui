import type {VisualizationLayerShared, VisualizationWithLayersShared} from 'shared';
import {createVisualizationLayer} from 'units/wizard/utils/wizard';

export const GEOLAYER_VISUALIZATION: VisualizationWithLayersShared['visualization'] = {
    id: 'geolayer',
    type: 'geo',
    name: 'label_visualization-geolayer',
    iconProps: {id: 'visGeolayers', width: '24'},
    layers: [
        createVisualizationLayer(
            'geopoint',
        ) as unknown as VisualizationLayerShared['visualization'],
    ], // by default, we add one layer with dots
    selectedLayerId: '',
    placeholders: [],
};
