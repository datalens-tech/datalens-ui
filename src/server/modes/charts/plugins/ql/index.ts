import {QL_TYPE} from '../../../../../shared';
import type {Plugin} from '../../../../components/charts-engine/types';

import {runQlChart} from './ql-chart-runner';

export const plugin: Plugin = {
    runners: [
        {
            name: 'ql',
            trigger: new Set([
                QL_TYPE.TIMESERIES_QL_NODE,
                QL_TYPE.GRAPH_QL_NODE,
                QL_TYPE.D3_QL_NODE,
                QL_TYPE.TABLE_QL_NODE,
                QL_TYPE.YMAP_QL_NODE,
                QL_TYPE.METRIC_QL_NODE,
                QL_TYPE.MARKUP_QL_NODE,

                QL_TYPE.LEGACY_GRAPH_QL_NODE,
                QL_TYPE.LEGACY_TABLE_QL_NODE,
                QL_TYPE.LEGACY_YMAP_QL_NODE,
                QL_TYPE.LEGACY_METRIC_QL_NODE,
            ]),
            safeConfig: true,
            handler: runQlChart,
        },
    ],
};
