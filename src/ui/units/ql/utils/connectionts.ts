import type {QLChartType} from 'shared';

import {AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE} from '../constants';

export const getConnectionsByChartType = (chartType: QLChartType) => {
    return AVAILABLE_CONNECTION_TYPES_BY_CHART_TYPE[chartType];
};
