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

function isMeasureFieldInColors(colors: Field[]) {
    return colors.length && isMeasureField(colors[0] || isMeasureValue(colors[0]));
}

function findMeasureNameOrValueFieldInSection(section: Field[]) {
    return section.find(isMeasureNameOrValue);
}

type OnMeasureAxisChangeArgs = {
    placeholder: Placeholder;
    colors: Field[];
    shapes: Field[];
    visualization: Shared['visualization'];
    placeholderId: PlaceholderId;
};

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
