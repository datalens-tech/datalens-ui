import {ArrowRight, ArrowUp, ChevronsExpandUpRight, Circles5Random} from '@gravity-ui/icons';

import type {Field, GraphShared, Placeholder, Shared} from '../../../shared';
import {WizardVisualizationId} from '../../../shared';
import {
    ITEM_TYPES,
    PRIMITIVE_DATA_TYPES,
    PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
    PRIMITIVE_DATA_TYPES_AND_MARKUP,
} from '../../constants/misc';
import {prepareFieldToMeasureTransformation} from '../../units/wizard/utils/visualization';
import {onMeasureAxisChange} from '../../utils/visualizations/placeholders/common-measures';

export const SCATTER_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Scatter,
    type: 'line',
    name: 'label_visualization-scatter',
    iconProps: {id: 'visScatter', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowShapes: true,
    shapesCapacity: 1,
    allowSort: true,
    checkAllowedSort: (item: Field, visualization: Shared['visualization']) => {
        if (item.type === 'MEASURE') {
            return false;
        }

        // slice because only selections from X and Y are allowed, but not from Points
        const selectedItems = (visualization.placeholders as Placeholder[])
            .slice(0, 2)
            .reduce((a: Field[], b) => a.concat(b.items), [])
            .filter((selectedItem) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: () => {
        return true;
    },
    checkAllowedShapes: ({item}: {item: Field}) => item.type === 'DIMENSION',
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            required: true,
            capacity: 1,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisLabelDateFormat: 'auto',
                axisLabelFormating: {},
                axisFormatMode: 'auto',
                axisModeMap: {},
                axisVisibility: 'show',
            },
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            required: true,
            capacity: 1,
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                axisLabelDateFormat: 'auto',
                axisLabelFormating: {},
                axisFormatMode: 'auto',
                axisVisibility: 'show',
            },
            onChange: onMeasureAxisChange,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_MARKUP,
            id: 'points',
            type: 'points',
            title: 'section_points',
            iconProps: {data: Circles5Random},
            items: [],
            capacity: 1,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'size',
            type: 'measures',
            title: 'section_points_size',
            iconProps: {data: ChevronsExpandUpRight},
            items: [],
            capacity: 1,
            transform: prepareFieldToMeasureTransformation,
        },
    ] as Placeholder[],
};

export const SCATTER_D3_VISUALIZATION: GraphShared['visualization'] = {
    ...SCATTER_VISUALIZATION,
    id: WizardVisualizationId.ScatterD3,
    allowComments: false,
};
