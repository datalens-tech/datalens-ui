import type {Shared} from 'shared';

import {DEFAULT_VISUALIZATION_ID_QL} from '../../constants';

import {getAvailableQlVisualizations} from './getAvailableQlVisualizations';

export function getDefaultQlVisualization(): Shared['visualization'] {
    const availableVisualizations = getAvailableQlVisualizations();

    // We use column chart as initial visualization type in QL and Wizard
    return (
        availableVisualizations.find(
            (visualization) => visualization.id === DEFAULT_VISUALIZATION_ID_QL,
        ) || availableVisualizations[0]
    );
}
