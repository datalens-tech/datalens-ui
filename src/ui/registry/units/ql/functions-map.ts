import type {QLChartType} from 'shared';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

export const qlFunctionsMap = {
    getDefaultMonitoringQLConnectionId: makeFunctionTemplate<(env: string) => string>(),
    getConnectionsByChartType: makeFunctionTemplate<(chartType: QLChartType) => string[]>(),
} as const;
