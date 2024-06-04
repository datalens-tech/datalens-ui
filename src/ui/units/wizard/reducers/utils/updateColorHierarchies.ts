import type {Field, HierarchyField, Shared} from 'shared';
import {isVisualizationWithLayers} from 'shared';

export function updateColorsHierarchies(
    colors: Field[],
    hierarchies: HierarchyField[],
    visualization: Shared['visualization'],
) {
    const hierarchiesDict = hierarchies.reduce((acc: Record<string, HierarchyField>, el) => {
        acc[el.guid] = el;
        return acc;
    }, {});

    const updatedColors = colors.map((field) => hierarchiesDict[field.guid] || field);
    let updatedVisualization = visualization;

    if (isVisualizationWithLayers(visualization)) {
        const updatedLayers = visualization.layers.map((layer) => {
            return {
                ...layer,
                commonPlaceholders: {
                    ...layer.commonPlaceholders,
                    colors: layer.commonPlaceholders?.colors?.map(
                        (field) => hierarchiesDict[field.guid] || field,
                    ),
                },
            };
        });

        updatedVisualization = {
            ...visualization,
            layers: updatedLayers,
        };
    }

    return {
        colors: updatedColors,
        visualization: updatedVisualization,
    };
}
