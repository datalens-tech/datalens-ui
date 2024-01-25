import {
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
    const colorsCopy: Field[] = [...colors];
    const shapesCopy: Field[] = [...shapes];
    if (colors?.length) {
        if (colors.length === 1 && isMeasureNameOrValue(colors[0])) {
            visualization.colorsCapacity = 2;
        } else if (colors.length === 2) {
            const isBothFieldsPseudo = colorsCopy.every((color) => isMeasureNameOrValue(color));

            const prevColorsGuidsMap = prevColors?.reduce((acc, color) => {
                return {
                    ...acc,
                    [color.guid || color.title]: true,
                };
            }, {} as Record<string, boolean>);

            const replacedItemIndex = colorsCopy.findIndex(
                (color) => prevColorsGuidsMap[color.guid || color.title],
            );

            colorsCopy.splice(replacedItemIndex, 1);

            if (!isBothFieldsPseudo) {
                visualization.colorsCapacity = 1;
                const yItems1 = placeholders[1].items;
                const yItems2 = placeholders[2] ? placeholders[2].items : [];

                yItems1.splice(1, yItems1.length - 1);
                yItems2.splice(1, yItems2.length - 1);
            }
        }
    }
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
        colors: colorsCopy,
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
