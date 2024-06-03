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
