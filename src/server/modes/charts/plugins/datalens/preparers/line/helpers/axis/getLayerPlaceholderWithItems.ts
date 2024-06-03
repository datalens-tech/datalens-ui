import type {
    PlaceholderId,
    ServerPlaceholder,
    ServerVisualization,
} from '../../../../../../../../../shared';

import type {GetLayerPlaceholderWithItemsOptions} from './types';

export const getLayerPlaceholderWithItems = (
    visualization: ServerVisualization,
    id: PlaceholderId,
    {isFirstFromTheTop}: GetLayerPlaceholderWithItemsOptions,
): ServerPlaceholder | undefined => {
    const layers = [...(visualization.layers || [])];

    if (isFirstFromTheTop) {
        layers.reverse();
    }

    let placeholder: ServerPlaceholder | undefined;

    layers.forEach((layer) => {
        const layersPlaceholder = layer.placeholders;
        placeholder = layersPlaceholder.find(
            (layerPlaceholder) => layerPlaceholder.id === id && layerPlaceholder.items.length,
        );

        if (placeholder) {
            return;
        }
    });

    return placeholder;
};
