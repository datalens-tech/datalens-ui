import {BucketPaint, ChartPie, LayoutColumns3} from '@gravity-ui/icons';
import {Field, GraphShared, Placeholder, PlaceholderId, WizardVisualizationId} from 'shared';
import {
    prepareFieldToDimensionTransformation,
    prepareFieldToMeasureTransformation,
} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, PRIMITIVE_DATA_TYPES_AND_HIERARCHY} from '../misc';

export const PIE_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Pie,
    type: 'pie',
    name: 'label_visualization-pie',
    iconProps: {id: 'visPie', width: '24'},
    allowFilters: true,
    allowLabels: true,
    allowSort: true,
    checkAllowedSort: (item: Field, visualization: GraphShared['visualization']) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = (visualization.placeholders as Placeholder[]).reduce(
            (a: Field[], b) => a.concat(b.items),
            [],
        );

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedLabels: (item: Field) => ITEM_TYPES.ALL.has(item.type),
    availableLabelModes: ['absolute', 'percent'],
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: PlaceholderId.Dimensions,
            type: PlaceholderId.Dimensions,
            title: 'section_categories',
            iconProps: {data: LayoutColumns3},
            items: [],
            required: false,
            capacity: 1,
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: PlaceholderId.Colors,
            type: PlaceholderId.Colors,
            title: 'section_color',
            iconProps: {data: BucketPaint},
            items: [],
            required: false,
            capacity: 1,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'measures',
            type: 'measures',
            title: 'section_measures',
            iconProps: {data: ChartPie},
            items: [],
            required: true,
            capacity: 1,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const PIE_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...PIE_VISUALIZATION,
    id: WizardVisualizationId.PieD3,
};
