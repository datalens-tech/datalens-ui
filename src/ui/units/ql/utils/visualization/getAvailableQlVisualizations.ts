import cloneDeep from 'lodash/cloneDeep';
import type {Placeholder, Shared} from 'shared';

import {
    AREA_100P_VISUALIZATION,
    AREA_VISUALIZATION,
    BAR_100P_VISUALIZATION,
    BAR_VISUALIZATION,
    COLUMN_100P_VISUALIZATION,
    COLUMN_VISUALIZATION,
    DONUT_VISUALIZATION,
    FLAT_TABLE_VISUALIZATION,
    LINE_VISUALIZATION,
    METRIC_VISUALIZATION,
    PIE_VISUALIZATION,
    SCATTER_VISUALIZATION,
    TREEMAP_VISUALIZATION,
} from '../../../../constants/visualizations';

export function getAvailableQlVisualizations(): Array<Shared['visualization']> {
    const items = [
        LINE_VISUALIZATION,
        AREA_VISUALIZATION,
        AREA_100P_VISUALIZATION,
        COLUMN_VISUALIZATION,
        COLUMN_100P_VISUALIZATION,
        BAR_VISUALIZATION,
        BAR_100P_VISUALIZATION,
        SCATTER_VISUALIZATION,
        PIE_VISUALIZATION,
        DONUT_VISUALIZATION,
        METRIC_VISUALIZATION,
        TREEMAP_VISUALIZATION,
        FLAT_TABLE_VISUALIZATION,
    ];

    return cloneDeep(items).map((visualization) => {
        visualization.placeholders.forEach((placeholder: Placeholder) => {
            if (placeholder.transform) {
                // eslint-disable-next-line no-param-reassign
                delete placeholder.transform;
            }
        });

        return {
            ...visualization,
            allowFilters: false,
            allowSegments: false,
            allowSort: false,
            allowAvailable: true,
        };
    });
}
