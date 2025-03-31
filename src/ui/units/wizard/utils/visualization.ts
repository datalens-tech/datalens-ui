import _ from 'lodash';
import get from 'lodash/get';

import type {ChartkitGlobalSettings, Field, Shared} from '../../../../shared';
import {DatasetFieldAggregation, WizardVisualizationId, isParameter} from '../../../../shared';
import {DL} from '../../../../ui';
import {
    AREA_100P_VISUALIZATION,
    AREA_VISUALIZATION,
    BAR_100P_VISUALIZATION,
    BAR_VISUALIZATION,
    BAR_X_D3_VISUALIZATION,
    BAR_Y_100P_D3_VISUALIZATION,
    BAR_Y_D3_VISUALIZATION,
    COLUMN_100P_VISUALIZATION,
    COLUMN_VISUALIZATION,
    COMBINED_CHART_VISUALIZATION,
    DONUT_D3_VISUALIZATION,
    DONUT_VISUALIZATION,
    FLAT_TABLE_VISUALIZATION,
    GEOLAYER_VISUALIZATION,
    GEOPOINT_VISUALIZATION,
    GEOPOINT_WITH_CLUSTER_VISUALIZATION,
    GEOPOLYGON_VISUALIZATION,
    HEATMAP_VISUALIZATION,
    LINE_D3_VISUALIZATION,
    LINE_VISUALIZATION,
    METRIC_VISUALIZATION,
    PIE_D3_VISUALIZATION,
    PIE_VISUALIZATION,
    PIVOT_TABLE_VISUALIZATION,
    POLYLINE_VISUALIZATION,
    SCATTER_D3_VISUALIZATION,
    SCATTER_VISUALIZATION,
    TREEMAP_D3_VISUALIZATION,
    TREEMAP_VISUALIZATION,
} from '../../../../ui/constants/visualizations';
import {ITEM_TYPES} from '../constants';

import {getCommonDataType} from './helpers';

export const prepareFieldToMeasureTransformation = (item: Field): Field => {
    if (ITEM_TYPES.MEASURES_AND_PSEUDO.has(item.type) || isParameter(item)) {
        return item;
    }

    const commonDataType = getCommonDataType(item.data_type);

    return {
        ...item,
        transformed: true,
        fakeTitle: item.fakeTitle || item.title,
        aggregation:
            commonDataType === 'number'
                ? DatasetFieldAggregation.Sum
                : DatasetFieldAggregation.Countunique,
    };
};

export function getAvailableVisualizations(options?: ChartkitGlobalSettings) {
    const {
        highcharts: {enabled: isHighchartsEnabled = false} = {},
        yandexMap: {enabled: isYandexMapEnabled = false} = {},
    } = options || DL.CHARTKIT_SETTINGS;

    const items: {value: Shared['visualization']; enabled: boolean}[] = [
        {
            value: LINE_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...LINE_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
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
            value: BAR_100P_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: SCATTER_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
        {
            value: {...BAR_Y_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
        },
        {
            value: {...BAR_Y_100P_D3_VISUALIZATION, hidden: isHighchartsEnabled},
            enabled: true,
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
        {
            value: PIVOT_TABLE_VISUALIZATION,
            enabled: true,
        },

        {
            value: GEOPOINT_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: GEOPOINT_WITH_CLUSTER_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: GEOPOLYGON_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: HEATMAP_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: GEOLAYER_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: POLYLINE_VISUALIZATION,
            enabled: isYandexMapEnabled,
        },
        {
            value: COMBINED_CHART_VISUALIZATION,
            enabled: isHighchartsEnabled,
        },
    ];

    return _.cloneDeep(items.filter((item) => item.enabled).map(({value}) => value));
}

const highchartsD3Map = [
    [WizardVisualizationId.Line, WizardVisualizationId.LineD3],
    [WizardVisualizationId.Column, WizardVisualizationId.BarXD3],
    [WizardVisualizationId.Scatter, WizardVisualizationId.ScatterD3],
    [WizardVisualizationId.Pie, WizardVisualizationId.PieD3],
    [WizardVisualizationId.Pie3D, WizardVisualizationId.PieD3],
    [WizardVisualizationId.Donut, WizardVisualizationId.DonutD3],
    [WizardVisualizationId.Bar, WizardVisualizationId.BarYD3],
    [WizardVisualizationId.Bar100p, WizardVisualizationId.BarY100pD3],
];

export function getHighchartsAnalog(visualizationId: WizardVisualizationId) {
    return highchartsD3Map.find(([_hc, d3]) => d3 === visualizationId)?.[0];
}

export function getD3Analog(visualizationId: WizardVisualizationId) {
    return highchartsD3Map.find(([hc, _d3]) => hc === visualizationId)?.[1];
}

export function getDefaultVisualization() {
    const defaultVisualizationIds = [WizardVisualizationId.Column, WizardVisualizationId.BarXD3];

    return getAvailableVisualizations().find((v) => {
        return defaultVisualizationIds.includes(v.id as WizardVisualizationId) && !get(v, 'hidden');
    });
}
