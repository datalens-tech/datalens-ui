import type {
    ServerColor,
    ServerField,
    ServerVisualizationLayer,
} from '../../../../../../../../../shared';
import {getFakeTitleOrTitle, isDimensionField} from '../../../../../../../../../shared';

interface GetColoredLineLegendTitleArgs {
    formattedValue: string;
    yItem: ServerField;
    colorItem: ServerColor;
    layers?: ServerVisualizationLayer[];
}

function isSameTitle(field: ServerField, otherField: ServerField) {
    return getFakeTitleOrTitle(field) === getFakeTitleOrTitle(otherField);
}

function getYItems(layer: ServerVisualizationLayer) {
    return layer.placeholders[1]?.items || [];
}

export function getColoredLineLegendTitle(args: GetColoredLineLegendTitleArgs) {
    const {layers, yItem, colorItem, formattedValue} = args;
    const coloredLayers =
        layers?.filter(
            (layer) => getYItems(layer).length && layer.commonPlaceholders.colors?.length,
        ) || [];

    if (coloredLayers.length > 1) {
        const isDifferentYItem = coloredLayers.some((layer) =>
            getYItems(layer).some((item) => !isSameTitle(item, yItem)),
        );

        const isDifferentColorItem = coloredLayers.some(({commonPlaceholders}) =>
            commonPlaceholders.colors.some(
                (item) => isDimensionField(item) && !isSameTitle(item, colorItem),
            ),
        );

        const legendTitleItems = [formattedValue];

        if (isDifferentColorItem) {
            legendTitleItems.unshift(getFakeTitleOrTitle(colorItem));
        }

        if (isDifferentYItem) {
            legendTitleItems.unshift(getFakeTitleOrTitle(yItem));
        }

        return legendTitleItems.join(': ');
    }

    return formattedValue;
}
