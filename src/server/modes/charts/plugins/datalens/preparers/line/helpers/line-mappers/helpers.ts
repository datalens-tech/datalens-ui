type GetColorShapeMappingValueArgs = {
    shownTitle: string;
    mountedValues: Record<string, string>;
    colorAndShapeKey: string;
};
export const getColorShapeMappingValue = ({
    mountedValues,
    shownTitle,
    colorAndShapeKey,
}: GetColorShapeMappingValueArgs) => {
    const isValueMountedByLegendTitle = typeof mountedValues[shownTitle] !== 'undefined';
    const isValueMountedByFieldTitle = typeof mountedValues[colorAndShapeKey] !== 'undefined';

    if (isValueMountedByLegendTitle && mountedValues[shownTitle] !== 'auto') {
        return shownTitle;
    }

    if (isValueMountedByFieldTitle && mountedValues[colorAndShapeKey] !== 'auto') {
        return colorAndShapeKey;
    }

    return undefined;
};
