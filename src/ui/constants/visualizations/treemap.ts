import {ChevronsExpandUpRight, GeoPolygons} from '@gravity-ui/icons';
import type {Field, GraphShared, Placeholder, Shared} from 'shared';
import {WizardVisualizationId, createMeasureNames, isMeasureNameOrValue} from 'shared';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, PRIMITIVE_DATA_TYPES_AND_HIERARCHY} from '../misc';

import {prepareFieldToDimensionTransformation} from './utils';

type OnTreemapDimensionsChangeArgs = {
    colors: Field[];
    visualization: Shared['visualization'];
};

export function onTreemapDimensionsChange({visualization, colors}: OnTreemapDimensionsChangeArgs) {
    // When changing the contents of dimensions, there is a possibility,
    // that there is no dimension for the selected sort.
    // In this case, you need to remove such sorting.
    let invalidIndex = 0;

    while (
        // eslint-disable-next-line
        colors.some((sortItem, i) => {
            if (
                !visualization.checkAllowedDesignItems?.({
                    item: sortItem,
                    visualization,
                    designItems: colors,
                })
            ) {
                invalidIndex = i;
                return true;
            }

            return false;
        })
    ) {
        colors.splice(invalidIndex, 1);
    }
}

type OnTreemapMeasuresChangeArgs = {
    placeholder: Placeholder;
    visualization: Shared['visualization'];
};

export function onTreemapMeasuresChange({placeholder, visualization}: OnTreemapMeasuresChangeArgs) {
    const dimensions = visualization.placeholders[0].items;

    const existingMeasureNameOrValue = dimensions.find(isMeasureNameOrValue);

    if (placeholder.items.length > 1 && !existingMeasureNameOrValue) {
        dimensions.push(createMeasureNames());
    } else if (placeholder.items.length < 2) {
        if (existingMeasureNameOrValue) {
            dimensions.splice(dimensions.indexOf(existingMeasureNameOrValue), 1);
        }
    }
}

export const TREEMAP_VISUALIZATION: GraphShared['visualization'] = {
    id: WizardVisualizationId.Treemap,
    type: 'treemap',
    name: 'label_visualization-treemap',
    allowFilters: true,
    iconProps: {id: 'visTreemap', width: '24'},
    allowColors: true,
    checkAllowedDesignItems: ({
        item,
        visualization,
    }: {
        item: Field;
        visualization?: Shared['visualization'];
    }) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const placeholders: Placeholder[] = visualization?.placeholders || [];
        const selectedItems = placeholders.reduce((a: Field[], b) => a.concat(b.items), []);

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'dimensions',
            type: 'dimensions',
            title: 'section_dimensions',
            iconProps: {data: GeoPolygons},
            items: [],
            onChange: onTreemapDimensionsChange,
            required: true,
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'measures',
            type: 'measures',
            title: 'section_size',
            iconProps: {data: ChevronsExpandUpRight},
            items: [],
            onChange: onTreemapMeasuresChange,
            required: true,
            capacity: 1,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};
