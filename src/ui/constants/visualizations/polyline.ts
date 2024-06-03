import {GeoDots, LayoutColumns3, SquareHashtag} from '@gravity-ui/icons';
import type {Field, VisualizationLayerShared} from 'shared';
import {DatasetFieldType, isMeasureValue} from 'shared';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES} from '../misc';

export const POLYLINE_VISUALIZATION = {
    id: 'polyline',
    type: 'geo',
    name: 'label_visualization-polyline',
    iconProps: {id: 'visGeopoint', width: '24'},
    allowTooltips: false,
    allowColors: true,
    allowFilters: true,
    allowLayerFilters: true,
    allowLabels: false,
    allowSort: true,
    checkAllowedSort: () => true,
    hidden: true,
    checkAllowedTooltips: (item: Field) =>
        item.type === DatasetFieldType.Measure || item.type === DatasetFieldType.Dimension,
    checkAllowedDesignItems: ({item}: {item: Field}) =>
        item.type === DatasetFieldType.Dimension || item.type === DatasetFieldType.Measure,
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: new Set(['geopoint']),
            id: 'polyline',
            type: 'polyline',
            title: 'section_polyline',
            iconProps: {data: GeoDots},
            items: [],
            required: true,
            settings: {
                polylinePoints: 'off',
            },
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            id: 'measures',
            type: 'measures',
            title: 'section_measures',
            iconProps: {data: SquareHashtag},
            items: [],
            transform: prepareFieldToMeasureTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'grouping',
            type: 'grouping',
            title: 'section_grouping',
            iconProps: {data: LayoutColumns3},
            items: [],
        },
    ],
} as unknown as VisualizationLayerShared['visualization'];
