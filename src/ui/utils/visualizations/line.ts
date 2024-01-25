import {
    Feature,
    Field,
    Placeholder,
    PlaceholderId,
    PlaceholderIndexes,
    Shared,
    createMeasureNames,
    isMeasureField,
    isMeasureNameOrValue,
    isMeasureValue,
} from 'shared';

import Utils from '../utils';

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

type OnMeasureAxisChangeArgs = {
    placeholder: Placeholder;
    colors: Field[];
    shapes: Field[];
    visualization: Shared['visualization'];
    placeholderId: PlaceholderId;
};

function isMeasureFieldInColors(colors: Field[]) {
    return colors.length && isMeasureField(colors[0] || isMeasureValue(colors[0]));
}

function findMeasureNameOrValueFieldInSection(section: Field[]) {
    return section.find(isMeasureNameOrValue);
}

export function onMeasureAxisChange({
    placeholder,
    placeholderId,
    colors,
    visualization,
    shapes,
}: OnMeasureAxisChangeArgs) {
    if (isMeasureFieldInColors(colors)) {
        return;
    }

    const xPlaceholder = visualization.placeholders[PlaceholderIndexes.xPlaceholder];
    const xPlaceholderItems = xPlaceholder?.items || [];

    const pseudoFieldInColors = findMeasureNameOrValueFieldInSection(colors);
    const pseudoFieldInShapes = findMeasureNameOrValueFieldInSection(shapes);
    const pseudoFieldInXSection = findMeasureNameOrValueFieldInSection(xPlaceholderItems);

    let oppositeMeasurePlaceholderIndex;
    let oppositeMeasurePlaceholderId;

    switch (placeholderId) {
        case 'y':
            oppositeMeasurePlaceholderIndex = PlaceholderIndexes.y2Placeholder;
            oppositeMeasurePlaceholderId = PlaceholderId.Y2;
            break;
        case 'y2':
            oppositeMeasurePlaceholderIndex = PlaceholderIndexes.yPlaceholder;
            oppositeMeasurePlaceholderId = PlaceholderId.Y;
            break;
        default:
            break;
    }

    if (!oppositeMeasurePlaceholderIndex) {
        return;
    }

    const oppositeMeasurePlaceholder = visualization.placeholders[oppositeMeasurePlaceholderIndex];

    let totalItemsCount = placeholder.items.length;

    if (
        oppositeMeasurePlaceholder &&
        oppositeMeasurePlaceholder.id === oppositeMeasurePlaceholderId
    ) {
        totalItemsCount += (oppositeMeasurePlaceholder.items || []).length;
    }

    if (Utils.isEnabledFeature(Feature.MultipleColorsInVisualization)) {
        return;
    }

    if (totalItemsCount > 1) {
        if (!pseudoFieldInXSection) {
            if (!pseudoFieldInColors) {
                if (colors.length > 0) {
                    colors.splice(0, colors.length);
                }

                colors.push(createMeasureNames());

                visualization.colorsCapacity = 2;
            }
            if (!pseudoFieldInShapes) {
                if (shapes.length > 0) {
                    shapes.splice(0, shapes.length);
                }

                shapes.push(createMeasureNames());

                visualization.shapesCapacity = 2;
            }
        }
    } else if (totalItemsCount < 2) {
        if (pseudoFieldInShapes || pseudoFieldInColors) {
            if (pseudoFieldInColors) {
                colors.splice(colors.indexOf(pseudoFieldInColors), 1);

                visualization.colorsCapacity = 1;
            }
            if (pseudoFieldInShapes) {
                shapes.splice(shapes.indexOf(pseudoFieldInShapes), 1);

                visualization.shapesCapacity = 1;
            }
        }
    } else if (pseudoFieldInXSection) {
        xPlaceholderItems.splice(xPlaceholderItems.indexOf(pseudoFieldInXSection), 1);
    }
}
