import _ from 'lodash';

import type {ChartkitGlobalSettings, Field} from '../../../../shared';
import {DatasetFieldAggregation, isParameter} from '../../../../shared';
import {DL} from '../../../../ui';
import {
    AREA_100P_VISUALIZATION,
    AREA_VISUALIZATION,
    BAR_100P_VISUALIZATION,
    BAR_VISUALIZATION,
    COLUMN_100P_VISUALIZATION,
    COLUMN_VISUALIZATION,
    COMBINED_CHART_VISUALIZATION,
    DONUT_VISUALIZATION,
    FLAT_TABLE_VISUALIZATION,
    GEOLAYER_VISUALIZATION,
    GEOPOINT_VISUALIZATION,
    GEOPOINT_WITH_CLUSTER_VISUALIZATION,
    GEOPOLYGON_VISUALIZATION,
    HEATMAP_VISUALIZATION,
    LINE_VISUALIZATION,
    METRIC_VISUALIZATION,
    PIE_VISUALIZATION,
    PIVOT_TABLE_VISUALIZATION,
    POLYLINE_VISUALIZATION,
    SCATTER_VISUALIZATION,
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
    const {yandexMap: {enabled: isYandexMapEnabled = false} = {}} = options || DL.CHARTKIT_SETTINGS;

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
        PIVOT_TABLE_VISUALIZATION,
    ];

    if (isYandexMapEnabled) {
        items.push(
            GEOPOINT_VISUALIZATION,
            GEOPOINT_WITH_CLUSTER_VISUALIZATION,
            GEOPOLYGON_VISUALIZATION,
            HEATMAP_VISUALIZATION,
            GEOLAYER_VISUALIZATION,
            POLYLINE_VISUALIZATION,
        );
    }

    items.push(COMBINED_CHART_VISUALIZATION);

    return _.cloneDeep(items);
}

export function getDefaultVisualization() {
    return _.cloneDeep(COLUMN_VISUALIZATION);
}
