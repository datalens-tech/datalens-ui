import {GeoPolygons} from '@gravity-ui/icons';
import type {Field, VisualizationLayerShared} from 'shared';

import {ITEM_TYPES} from '../misc';

export const GEOPOLYGON_VISUALIZATION = {
    id: 'geopolygon',
    type: 'geo',
    name: 'label_visualization-geopolygon',
    iconProps: {id: 'visGeopolygon', width: '24'},
    allowTooltips: true,
    allowColors: true,
    allowFilters: true,
    allowLayerFilters: true,
    hidden: true,
    checkAllowedTooltips: (item: Field) => item.type === 'MEASURE' || item.type === 'DIMENSION',
    checkAllowedDesignItems: ({item}: {item: Field}) =>
        item.type === 'MEASURE' || item.type === 'DIMENSION',
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: new Set(['geopolygon']),
            id: 'geopolygon',
            type: 'geopolygon',
            title: 'section_geopolygon',
            iconProps: {data: GeoPolygons},
            items: [],
            required: true,
        },
    ],
} as unknown as VisualizationLayerShared['visualization'];
