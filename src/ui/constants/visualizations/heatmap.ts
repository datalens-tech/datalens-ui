import {GeoDots} from '@gravity-ui/icons';
import type {Field, VisualizationLayerShared} from 'shared';

import {ITEM_TYPES} from '../misc';

export const HEATMAP_VISUALIZATION = {
    id: 'heatmap',
    type: 'geo',
    name: 'label_visualization-heatmap',
    iconProps: {id: 'visHeatmap', width: '24'},
    allowColors: true,
    allowFilters: true,
    allowLayerFilters: true,
    hidden: true,
    checkAllowedDesignItems: ({item}: {item: Field}) => {
        return item.type === 'MEASURE' || item.cast === 'geopoint' || item.data_type === 'geopoint';
    },
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: new Set(['geopoint']),
            id: 'heatmap',
            type: 'geopoint',
            title: 'section_geopoint',
            iconProps: {data: GeoDots},
            items: [],
            required: true,
        },
    ],
} as unknown as VisualizationLayerShared['visualization'];
