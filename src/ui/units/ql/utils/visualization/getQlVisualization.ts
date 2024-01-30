import mergeWith from 'lodash/mergeWith';
import {Shared} from 'shared';

import {getAvailableQlVisualizations, getDefaultQlVisualization} from '../visualization';

export const getQlVisualization = (
    visualizationId: string,
    loadedVisualization: Shared['visualization'],
): Shared['visualization'] => {
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
                if (
                    key === 'placeholders' &&
                    Object.hasOwnProperty.call(obj, 'placeholders') &&
                    Object.hasOwnProperty.call(source, 'placeholders')
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
