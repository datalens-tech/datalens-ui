import cloneDeep from 'lodash/cloneDeep';
import type {ChartkitGlobalSettings, Placeholder, Shared} from 'shared';
import {DL} from 'ui/constants/common';

import {
    AREA_100P_VISUALIZATION,
    AREA_VISUALIZATION,
    BAR_100P_VISUALIZATION,
    BAR_VISUALIZATION,
    BAR_X_D3_VISUALIZATION,
    BAR_Y_D3_VISUALIZATION,
    COLUMN_100P_VISUALIZATION,
    COLUMN_VISUALIZATION,
    DONUT_D3_VISUALIZATION,
    DONUT_VISUALIZATION,
    FLAT_TABLE_VISUALIZATION,
    LINE_VISUALIZATION,
    METRIC_VISUALIZATION,
    PIE_D3_VISUALIZATION,
    PIE_VISUALIZATION,
    SCATTER_D3_VISUALIZATION,
    SCATTER_VISUALIZATION,
    TREEMAP_D3_VISUALIZATION,
    TREEMAP_VISUALIZATION,
} from '../../../../constants/visualizations';

export function getAvailableQlVisualizations(
    options?: ChartkitGlobalSettings,
): Array<Shared['visualization']> {
    const {highcharts: {enabled: isHighchartsEnabled = false} = {}} =
        options || DL.CHARTKIT_SETTINGS;

    const items: {value: Shared['visualization']; enabled: boolean}[] = [
        {
            value: LINE_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: AREA_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: AREA_100P_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: COLUMN_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...BAR_X_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: COLUMN_100P_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: BAR_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...BAR_Y_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: BAR_100P_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: SCATTER_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...SCATTER_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: PIE_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...PIE_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: DONUT_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...DONUT_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: METRIC_VISUALIZATION,
            enabled: true,
        },
        {
            value: TREEMAP_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...TREEMAP_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: FLAT_TABLE_VISUALIZATION,
            enabled: true,
        },
    ];

    return cloneDeep(items.filter((item) => item.enabled).map(({value}) => value)).map(
        (visualization) => {
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
        },
    );
}
