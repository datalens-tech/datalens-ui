import {SquareHashtag} from '@gravity-ui/icons';

import type {Shared} from '../../../shared';
import {prepareFieldToMeasureTransformation} from '../../units/wizard/utils/visualization';
import {ITEM_TYPES, PRIMITIVE_DATA_TYPES_AND_MARKUP} from '../misc';

export const METRIC_VISUALIZATION: Shared['visualization'] = {
    id: 'metric',
    type: 'metric',
    name: 'label_visualization-metric',
    iconProps: {id: 'visMetric', width: '24'},
    allowFilters: true,
    allowLabels: false,
    allowSort: false,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_MARKUP,
            id: 'measures',
            type: 'measures',
            title: 'section_measure',
            iconProps: {data: SquareHashtag},
            items: [],
            required: true,
            capacity: 1,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};
