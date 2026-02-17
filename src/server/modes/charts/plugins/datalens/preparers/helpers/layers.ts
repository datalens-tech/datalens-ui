import type {ServerPlaceholder, Shared} from '../../../../../../../shared';
import {PlaceholderId, isVisualizationWithLayers} from '../../../../../../../shared';
import {getLayerPlaceholderWithItems} from '../line/helpers/axis/getLayerPlaceholderWithItems';
import type {PrepareFunctionArgs} from '../types';

export function getYPlaceholders(args: PrepareFunctionArgs) {
    const {shared, placeholders, layerSettings} = args;
    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);
    const visualization = shared.visualization as Shared['visualization'];

    let layerYPlaceholder: ServerPlaceholder | undefined;
    let layerY2Placeholder: ServerPlaceholder | undefined;

    if (isVisualizationWithLayers(visualization)) {
        const lastLayer = visualization.layers[visualization.layers.length - 1];

        if (lastLayer.layerSettings.id === layerSettings.id) {
            layerYPlaceholder = yPlaceholder;
            layerY2Placeholder = y2Placeholder;

            if (!layerYPlaceholder?.items.length) {
                layerYPlaceholder = getLayerPlaceholderWithItems(
                    shared.visualization,
                    PlaceholderId.Y,
                    {isFirstFromTheTop: true},
                );
            }

            if (!layerY2Placeholder?.items.length) {
                layerY2Placeholder = getLayerPlaceholderWithItems(
                    shared.visualization,
                    PlaceholderId.Y2,
                    {isFirstFromTheTop: true},
                );
            }
        }
    } else {
        layerYPlaceholder = yPlaceholder;
        layerY2Placeholder = y2Placeholder;
    }

    return [layerYPlaceholder, layerY2Placeholder];
}

/**
 * Determines if a given layer is an additional (non-primary) layer within a collection.
 * The first layer in the `layers` array is considered the primary layer.
 *
 * There is no category sorting for additional labels.
 *
 * @returns {boolean} - `true` if the layer is not the first one in the array, otherwise `false`.
 **/
export function getIsAdditionalLayer({
    shared,
    layerSettings,
}: {
    shared: PrepareFunctionArgs['shared'];
    layerSettings: PrepareFunctionArgs['layerSettings'];
}) {
    const layers = shared.visualization.layers ?? [];
    const layerIndex = layers.findIndex((l) => l?.layerSettings?.id === layerSettings?.id);
    return layers.length > 1 && layerIndex > 0;
}
