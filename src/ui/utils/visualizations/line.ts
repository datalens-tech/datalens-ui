import {
    Field,
    Placeholder,
    Shared,
    isMeasureField,
    isMeasureNameOrValue,
    isMeasureValue,
} from 'shared';

import {updateColors} from './placeholders/colors';

type LinearCheckColorArgs = {
    item: Field;
    designItems: Field[];
    visualization?: Shared['visualization'];
};

export function linearCheckColor({item, visualization, designItems}: LinearCheckColorArgs) {
    if (isMeasureField(item) || isMeasureValue(item)) {
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

        return selectedItems.every((selectedItem: Field) => {
            return selectedItem.guid !== item.guid;
        });
    }
}

type OnLineChartColorsChangeArgs = {
    colors?: Field[];
    shapes?: Field[];
    prevColors?: Field[];
    visualization: Shared['visualization'];
};

export function onLineChartDesignItemsChange({
    colors = [],
    visualization,
    prevColors = [],
    shapes = [],
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
        colors: updateColors({colors, prevColors, placeholders, visualization}),
    };
}
