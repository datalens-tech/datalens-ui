import omit from 'lodash/omit';
import pick from 'lodash/pick';
import type {
    ColorsConfig,
    Field,
    ShapesConfig,
    Shared,
    Sort,
    VisualizationLayerShared,
} from 'shared';
import {WizardVisualizationId, isParameter, isVisualizationWithLayers} from 'shared';

import {ALLOWED_FOR_NULL_MODE_VISUALIZATIONS} from '../../constants/dialogColor';
import {getSelectedLayer} from '../../utils/helpers';

const VISUALIZATION_FIELDS_KEYS: Array<keyof VisualizationFields> = [
    'shapes',
    'shapesConfig',
    'colorsConfig',
    'colors',
    'labels',
    'sort',
];

type ClearUnusedVisualizationItems = {
    visualization: Shared['visualization'];
    items: VisualizationFields;
};

export type VisualizationFields = {
    shapes: Field[];
    shapesConfig: ShapesConfig;
    colors: Field[];
    colorsConfig: ColorsConfig;
    sort: Sort[];
    labels: Field[];
    segments: Field[];
};

type PreparedShapesItems = {
    shapes: Field[];
    shapesConfig?: ShapesConfig;
};

type PrepareVisualizationItemsOptions = {
    isLayer: boolean;
    isCombinedChart: boolean;
};

function prepareShapes(visualization: any, shapes: Field[]): PreparedShapesItems {
    if (visualization?.allowShapes) {
        return {
            shapes: shapes.filter((item) => {
                if (item.type === 'PSEUDO' || isParameter(item)) {
                    return true;
                }
                return (visualization as any)?.checkAllowedShapes?.({
                    item,
                    visualization,
                    designItems: shapes,
                });
            }),
        };
    } else {
        return {
            shapes: [],
            shapesConfig: {},
        };
    }
}

type PrepareColorsItems = {
    colors: Field[];
    colorsConfig?: ColorsConfig;
};

function prepareColors(
    visualization: any,
    colors: Field[],
    colorsConfig: ColorsConfig,
): PrepareColorsItems {
    const isPieOrDonut = [
        WizardVisualizationId.Donut,
        WizardVisualizationId.Pie,
        WizardVisualizationId.Pie3D,
        WizardVisualizationId.PieD3,
        WizardVisualizationId.DonutD3,
    ].includes(visualization?.id);

    // Historically, the Pie Chart and the Ring Chart had their own placeholders for colors
    // Thus, there is no allowColors, and we always fall into else here and could never change colors and so on.
    if (visualization?.allowColors || isPieOrDonut) {
        const updatedColors = colors.filter((item) => {
            if (item.type === 'PSEUDO' || isParameter(item)) {
                return true;
            }
            return (visualization as any)?.checkAllowedDesignItems?.({
                item,
                visualization,
                designItems: colors,
            });
        });

        const updatedColorsConfig = ALLOWED_FOR_NULL_MODE_VISUALIZATIONS.includes(visualization?.id)
            ? colorsConfig
            : omit(colorsConfig, 'nullMode');

        return {
            colors: updatedColors,
            colorsConfig: updatedColorsConfig,
        };
    } else {
        return {
            colors: [],
            colorsConfig: {},
        };
    }
}

function prepareSort(
    visualization: any,
    sort: Sort[],
    colors: Field[],
    segments: Field[],
    options: PrepareVisualizationItemsOptions,
): {sort: Sort[]} {
    if (options.isCombinedChart) {
        return {sort: [...sort]};
    }
    if (visualization?.allowSort) {
        return {
            sort: sort.filter((item) => {
                if (isParameter(item)) {
                    return true;
                }
                return (visualization as any)?.checkAllowedSort(
                    item,
                    visualization,
                    colors,
                    segments,
                );
            }),
        };
    } else {
        return {
            sort: [],
        };
    }
}

function prepareLabels(visualization: any, labels: Field[]): {labels: Field[]} {
    if (visualization?.allowLabels) {
        const {availableLabelModes = []} = visualization;

        return {
            labels: labels.map((label) => {
                if (!availableLabelModes.includes(label.mode!)) {
                    return {
                        ...label,
                        mode: availableLabelModes[0],
                    };
                }

                return label;
            }),
        };
    } else {
        return {
            labels: [],
        };
    }
}

function prepareSegments(
    visualization: any,
    segments: Field[],
    options: PrepareVisualizationItemsOptions,
): {segments: Field[]} {
    if (visualization.allowSegments && !options.isLayer) {
        return {
            segments,
        };
    }

    return {
        segments: [],
    };
}

function prepareVisualizationItems(
    items: VisualizationFields,
    currentVisualization: Shared['visualization'] | undefined,
    options: PrepareVisualizationItemsOptions,
) {
    if (!currentVisualization) {
        return items;
    }

    const preparedShapes = items.shapes
        ? prepareShapes(currentVisualization, items.shapes)
        : undefined;

    const preparedColors = prepareColors(currentVisualization, items.colors, items.colorsConfig);

    const preparedLabels = prepareLabels(currentVisualization, items.labels);

    const preparedSegments = prepareSegments(currentVisualization, items.segments, options);

    const preparedSort = prepareSort(
        currentVisualization,
        items.sort,
        preparedColors.colors,
        preparedSegments.segments,
        options,
    );

    return {
        ...items,
        ...preparedShapes,
        ...preparedColors,
        ...preparedSort,
        ...preparedLabels,
        ...preparedSegments,
    };
}

export function prepareCommonPlaceholderItems(
    layer: VisualizationLayerShared['visualization'],
    options: PrepareVisualizationItemsOptions,
): VisualizationLayerShared['visualization']['commonPlaceholders'] {
    const commonPlaceholders: VisualizationLayerShared['visualization']['commonPlaceholders'] =
        layer.commonPlaceholders || {};

    const commonPlaceholdersItems: VisualizationFields = pick(
        commonPlaceholders,
        VISUALIZATION_FIELDS_KEYS,
    ) as VisualizationFields;
    const updatedCommonPlaceholdersItems = prepareVisualizationItems(
        commonPlaceholdersItems,
        layer,
        options,
    );
    return {
        ...commonPlaceholders,
        ...updatedCommonPlaceholdersItems,
    };
}

export function clearUnusedVisualizationItems({
    visualization,
    items,
}: ClearUnusedVisualizationItems): VisualizationFields {
    const options: PrepareVisualizationItemsOptions = {
        isLayer: false,
        isCombinedChart: visualization.id === WizardVisualizationId.CombinedChart,
    };

    let currentVisualization;

    if (isVisualizationWithLayers(visualization)) {
        currentVisualization = getSelectedLayer(visualization);
        const layers = visualization.layers;
        visualization.layers = layers.map((layer) => ({
            ...layer,
            commonPlaceholders: prepareCommonPlaceholderItems(layer, options),
        }));
        options.isLayer = true;
    } else {
        currentVisualization = visualization;
    }

    return prepareVisualizationItems(items, currentVisualization, options);
}
