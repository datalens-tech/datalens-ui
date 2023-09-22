import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    ChevronsExpandUpRight,
    Circles5Random,
} from '@gravity-ui/icons';
import {
    Field,
    GraphShared,
    Placeholder,
    PlaceholderId,
    PlaceholderIndexes,
    Shared,
    createMeasureNames,
    isMeasureField,
    isMeasureName,
    isMeasureNameOrValue,
    isMeasureValue,
} from 'shared';
import {checkAllowedAreaSort} from 'units/wizard/utils/helpers';
import {
    prepareFieldToDimensionTransformation,
    prepareFieldToMeasureTransformation,
} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES, PRIMITIVE_DATA_TYPES_AND_HIERARCHY} from '../misc';

type LinearCheckColorArgs = {
    item: Field;
    designItems: Field[];
    visualization?: Shared['visualization'];
};

function linearCheckColor({item, visualization, designItems}: LinearCheckColorArgs) {
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

function onLineChartDesignItemsChange({
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

// eslint-disable-next-line complexity
function onMeasureAxisChange({
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

export const LINE_VISUALIZATION: GraphShared['visualization'] = {
    id: 'line' as const,
    type: 'line',
    name: 'label_visualization-line',
    iconProps: {id: 'visLines', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowLabels: true,
    allowSegments: true,
    allowShapes: true,
    colorsCapacity: 1,
    shapesCapacity: 1,
    checkAllowedSort: (
        item: Field,
        visualization: GraphShared['visualization'],
        _colors: Field[],
        segments?: Field[],
    ) => {
        if (item.type === 'MEASURE') {
            return false;
        }

        const selectedItems = visualization.placeholders
            .reduce((a: Field[], b: Placeholder) => a.concat(b.items), [])
            .concat(segments || [])
            .filter((selectedItem) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: linearCheckColor,
    checkAllowedShapes: linearCheckColor,
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
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
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
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
                nulls: 'ignore',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y2',
            type: 'y2',
            title: 'section_y2',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
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
                nulls: 'ignore',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const AREA_VISUALIZATION: GraphShared['visualization'] = {
    id: 'area',
    type: 'line',
    name: 'label_visualization-area',
    iconProps: {id: 'visArea', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowSegments: true,
    allowLabels: true,
    checkAllowedSort: checkAllowedAreaSort,
    checkAllowedDesignItems: linearCheckColor,
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
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
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
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
                nulls: 'as-0',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const AREA_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...AREA_VISUALIZATION,
    id: 'area100p',
    highchartsId: 'area',
    name: 'label_visualization-area-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visArea100p', width: '24'},
};

export const COLUMN_VISUALIZATION: GraphShared['visualization'] = {
    id: 'column',
    type: 'column',
    name: 'label_visualization-column',
    iconProps: {id: 'visColumn', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowSegments: true,
    allowLabels: true,
    checkAllowedSort: (
        item: Field,
        visualization: Shared['visualization'],
        colors: Field[],
        segments?: Field[],
    ) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = (visualization.placeholders as Placeholder[])
            .reduce((a: Field[], b) => a.concat(b.items), [])
            .concat(colors)
            .concat(segments || [])
            .filter((selectedItem: Field) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: ({item, designItems}: {item: Field; designItems: Field[]}) => {
        if (isMeasureName(item)) {
            return designItems.every((selectedItem) => {
                return !isMeasureName(selectedItem);
            });
        } else if (isMeasureValue(item)) {
            return designItems.every((selectedItem) => {
                return !isMeasureValue(selectedItem);
            });
        }

        return true;
    },
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            required: false,
            capacity: 2,
            settings: {
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowUp},
            items: [],
            onChange: onMeasureAxisChange,
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
                nulls: 'ignore',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const COLUMN_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...COLUMN_VISUALIZATION,
    id: 'column100p',
    highchartsId: 'column',
    name: 'label_visualization-column-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visColumn100p', width: '24'},
};

export const BAR_VISUALIZATION: GraphShared['visualization'] = {
    id: 'bar',
    type: 'column',
    name: 'label_visualization-bar',
    iconProps: {id: 'visBar', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    allowLabels: true,
    checkAllowedSort: (item: Field, visualization: Shared['visualization'], colors: Field[]) => {
        if (item.type === 'MEASURE') {
            return true;
        }

        const selectedItems = (visualization.placeholders as Placeholder[])
            .reduce((a: Field[], b) => a.concat(b.items), [])
            .concat(colors)
            .filter((selectedItem) => selectedItem.type === 'DIMENSION');

        return selectedItems.some((selectedItem) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: ({item, designItems}: {item: Field; designItems: Field[]}) => {
        if (isMeasureName(item)) {
            return designItems.every((selectedItem) => {
                return !isMeasureName(selectedItem);
            });
        } else if (isMeasureValue(item)) {
            return designItems.every((selectedItem) => {
                return !isMeasureValue(selectedItem);
            });
        }

        return true;
    },
    checkAllowedLabels: (item: Field) =>
        ITEM_TYPES.DIMENSIONS_AND_MEASURES.has(item.type) || isMeasureValue(item),
    availableLabelModes: ['absolute'],
    onDesignItemsChange: onLineChartDesignItemsChange,
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            allowedDataTypes: PRIMITIVE_DATA_TYPES_AND_HIERARCHY,
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {data: ArrowDown},
            items: [],
            required: false,
            capacity: 2,
            settings: {
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
            transform: prepareFieldToDimensionTransformation,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {data: ArrowRight},
            items: [],
            onChange: onMeasureAxisChange,
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
                nulls: 'ignore',
                holidays: 'off',
                axisFormatMode: 'auto',
            },
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};

export const BAR_100P_VISUALIZATION: GraphShared['visualization'] = {
    ...BAR_VISUALIZATION,
    id: 'bar100p',
    highchartsId: 'bar',
    name: 'label_visualization-bar-100p',
    availableLabelModes: ['absolute', 'percent'],
    iconProps: {id: 'visBar100p', width: '24'},
};

export const SCATTER_VISUALIZATION: GraphShared['visualization'] = {
    id: 'scatter',
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
                axisFormatMode: 'auto',
                axisModeMap: {},
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
                axisFormatMode: 'auto',
            },
            onChange: onMeasureAxisChange,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'points',
            type: 'points',
            title: 'section_points',
            iconProps: {data: Circles5Random},
            items: [],
            capacity: 1,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedDataTypes: PRIMITIVE_DATA_TYPES,
            id: 'size',
            type: 'measures',
            title: 'section_points_size',
            iconProps: {data: ChevronsExpandUpRight},
            items: [],
            capacity: 1,
        },
    ],
};
