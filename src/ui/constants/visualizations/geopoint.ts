import {ChevronsExpandUpRight, GeoDots} from '@gravity-ui/icons';
import cloneDeep from 'lodash/cloneDeep';
import type {Field, VisualizationLayerShared} from 'shared';
import {isMeasureValue} from 'shared';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES} from '../misc';

export const GEOPOINT_VISUALIZATION = {
    id: 'geopoint',
    type: 'geo',
    name: 'label_visualization-geopoint',
    iconProps: {id: 'visGeopoint', width: '24'},
    allowTooltips: true,
    allowColors: true,
    allowFilters: true,
    allowLayerFilters: true,
    allowLabels: true,
    hidden: true,
    checkAllowedTooltips: (item: Field) => item.type === 'MEASURE' || item.type === 'DIMENSION',
    checkAllowedDesignItems: ({item}: {item: Field}) =>
        item.type === 'MEASURE' || item.type === 'DIMENSION',
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: new Set(['geopoint']),
            id: 'geopoint',
            type: 'geopoint',
            title: 'section_geopoint',
            iconProps: {data: GeoDots},
            items: [],
            required: true,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'size',
            type: 'measures',
            title: 'section_points_size',
            iconProps: {data: ChevronsExpandUpRight},
            items: [],
            capacity: 1,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
} as unknown as VisualizationLayerShared['visualization'];

export const GEOPOINT_WITH_CLUSTER_VISUALIZATION = {
    ...cloneDeep(GEOPOINT_VISUALIZATION),
    id: 'geopoint-with-cluster',
    name: 'label_visualization-geopoint-with-cluster',
    checkAllowedDesignItems: ({item}: {item: Field}) => item.type === 'DIMENSION',
} as VisualizationLayerShared['visualization'];
