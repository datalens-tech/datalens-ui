import mergeWith from 'lodash/mergeWith';
import type {Shared} from 'shared';
import {QlVisualizationId, WizardVisualizationId} from 'shared';

import {getAvailableQlVisualizations, getDefaultQlVisualization} from '../visualization';

export const getQlVisualization = (
    loadedVisualization: Shared['visualization'],
): Shared['visualization'] => {
    const visualizationId =
        loadedVisualization.id === QlVisualizationId.FlatTable
            ? WizardVisualizationId.FlatTable
            : loadedVisualization.id;
    const availableVisualizations = getAvailableQlVisualizations();

    const candidate = availableVisualizations.find((vis) => vis.id === visualizationId);

    if (candidate) {
        return mergeWith(
            {},
            candidate,
            loadedVisualization,
            (
                value: any,
                _sourceValue: any,
                key,
                obj: Shared['visualization'] | {},
                source: Shared['visualization'],
            ) => {
                // It needs to prevent override properties which already defined in candidate visualization
                if (
                    Object.hasOwnProperty.call(obj, key) &&
                    Object.hasOwnProperty.call(source, key)
                ) {
                    return value;
                }

                return undefined;
            },
        );
    } else {
        return getDefaultQlVisualization();
    }
};
