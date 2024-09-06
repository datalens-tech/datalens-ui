import type {Field, Placeholder, Shared} from 'shared';
import {
    DATASET_FIELD_TYPES,
    Feature,
    isMarkupField,
    isMeasureField,
    isMeasureName,
    isMeasureNameOrValue,
    isMeasureValue,
} from 'shared';

import {ITEM_TYPES} from '../../constants/misc';
import Utils from '../utils';

import {updateColors} from './placeholders/colors';

type CommonCheckColorArgs = {
    item: Field;
    designItems: Field[];
    visualization?: Shared['visualization'];
    isMultipleColorsSupported?: boolean;
};

export function linearCheckColor({
    item,
    visualization,
    designItems,
    isMultipleColorsSupported,
}: CommonCheckColorArgs) {
    if (
        isMeasureField(item) ||
        isMeasureValue(item) ||
        item.data_type === DATASET_FIELD_TYPES.MARKUP
    ) {
        return false;
    }

    if (isMeasureNameOrValue(item)) {
        const selectedItems = designItems;

        if (selectedItems.length === 0) {
            return true;
        }

        return selectedItems.every((selectedItem) => {
            return !isMeasureNameOrValue(selectedItem);
        });
    } else {
        const placeholders: Placeholder[] = visualization?.placeholders || [];
        const selectedItems = placeholders.reduce(
            (a: Field[], b: Placeholder) => a.concat(b.items),
            [],
        );

        if (isMultipleColorsSupported) {
            selectedItems.push(...designItems);
        }

        return selectedItems.every((selectedItem: Field) => {
            return selectedItem.guid !== item.guid;
        });
    }
}

export function lineCommonCheckColor({
    item,
    designItems,
    isMultipleColorsSupported,
}: CommonCheckColorArgs) {
    if (isMeasureName(item)) {
        return designItems.every((selectedItem) => {
            return !isMeasureName(selectedItem);
        });
    } else if (isMeasureValue(item)) {
        return designItems.every((selectedItem) => {
            return !isMeasureValue(selectedItem);
        });
    }

    if (isMultipleColorsSupported) {
        return designItems.every((selectedItem) => selectedItem.guid !== item.guid);
    }

    return true;
}

type OnLineChartColorsChangeArgs = {
    colors?: Field[];
    shapes?: Field[];
    prevColors?: Field[];
    visualization: Shared['visualization'];
    isMultipleColorsSupported?: boolean;
};

export function onLineChartDesignItemsChange({
    colors = [],
    visualization,
    prevColors = [],
    shapes = [],
    isMultipleColorsSupported = false,
}: OnLineChartColorsChangeArgs) {
    const placeholders = visualization.placeholders;
    const shapesCopy: Field[] = [...shapes];

    if (shapes?.length) {
        if (shapes.length === 1 && isMeasureNameOrValue(shapes[0])) {
            visualization.shapesCapacity = 2;
        } else if (shapes.length === 2) {
            const shapesPseudoIndex = shapesCopy.findIndex((shape) => isMeasureNameOrValue(shape));

            shapesCopy.splice(shapesPseudoIndex, 1);

            visualization.shapesCapacity = 1;

            const yItems1 = placeholders[1].items;
            const yItems2 = placeholders[2] ? placeholders[2].items : [];

            yItems1.splice(1, yItems1.length - 1);
            yItems2.splice(1, yItems2.length - 1);
        }
    }
    return {
        shapes: shapesCopy,
        colors: updateColors({
            colors,
            prevColors,
            placeholders,
            visualization,
            isMultipleColorsSupported,
        }),
    };
}

export function linearCheckLabels(item: Field) {
    if (isMarkupField(item)) {
        return Utils.isEnabledFeature(Feature.MarkupInLabels);
    }

    return ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item);
}
