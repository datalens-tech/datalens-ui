import {Field, Placeholder, PlaceholderId, type Shared, isMeasureNameOrValue} from 'shared';
import {selectPlaceholders} from 'shared/modules/visualization/placeholder';

type UpdateMultipleColorsArgs = {
    colors: Field[];
    placeholders: Placeholder[];
    prevColors: Field[];
};
export const updateMultipleColors = (args: UpdateMultipleColorsArgs) => {
    const {colors, placeholders} = args;

    if (colors.length <= 1) {
        return colors;
    }

    const {y, y2} = selectPlaceholders(placeholders, [PlaceholderId.Y, PlaceholderId.Y2]);

    const yItems = y?.items || [];
    const y2Items = y2?.items || [];

    yItems.splice(1, yItems.length - 1);
    y2Items.splice(1, y2Items.length - 1);

    return colors;
};

type UpdateColorsArgs = {
    colors: Field[];
    prevColors: Field[];
    placeholders: Placeholder[];
    visualization: Shared['visualization'];
    isMultipleColorsSupported?: boolean;
};
export const updateColors = (args: UpdateColorsArgs) => {
    const {colors, prevColors, placeholders, visualization, isMultipleColorsSupported} = args;

    if (colors?.length && isMultipleColorsSupported) {
        return updateMultipleColors({
            colors,
            prevColors,
            placeholders,
        });
    }

    const colorsCopy = [...colors];

    if (colors?.length === 1 && isMeasureNameOrValue(colors[0])) {
        visualization.colorsCapacity = 2;
    }

    if (colors?.length === 2) {
        const isBothFieldsPseudo = colorsCopy.every((color) => isMeasureNameOrValue(color));

        const prevColorsGuidsMap = prevColors?.reduce(
            (acc, color) => {
                return {
                    ...acc,
                    [color.guid || color.title]: true,
                };
            },
            {} as Record<string, boolean>,
        );

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
    return colorsCopy;
};
