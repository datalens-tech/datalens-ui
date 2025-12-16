import {SquareHashtag} from '@gravity-ui/icons';
import type {GraphShared} from 'shared';
import {WizardVisualizationId} from 'shared';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES} from '../misc';

export const FUNNEL_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Funnel,
    type: 'funnel',
    name: 'label_visualization-funnel',
    iconProps: {id: 'visFunnel', width: '24'},
    allowColors: false,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'measures',
            type: 'measures',
            title: 'section_measures',
            iconProps: {data: SquareHashtag},
            items: [],
            required: true,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};
