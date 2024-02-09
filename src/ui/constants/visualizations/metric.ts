import {SquareHashtag} from '@gravity-ui/icons';

import {Feature, Field, Shared} from '../../../shared';
import {prepareFieldToMeasureTransformation} from '../../units/wizard/utils/visualization';
import Utils from '../../utils';
import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, PRIMITIVE_DATA_TYPES_AND_MARKUP} from '../misc';

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
            // We need to set allowedDataTypes to undefined, so it will overwrite client settings
            allowedDataTypes: undefined,
            checkAllowed: (item: Field) => {
                const allowedDataTypes = Utils.isEnabledFeature(Feature.MarkupMetric)
                    ? PRIMITIVE_DATA_TYPES_AND_MARKUP
                    : PRIMITIVE_DATA_TYPES;

                return allowedDataTypes.has(item.data_type);
            },
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
