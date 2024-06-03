import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import {QL_TYPE} from '../../../../../shared';
import type {ChartsEngine} from '../../../../components/charts-engine';
import type {ResolvedConfig} from '../../../../components/charts-engine/components/storage/types';
import {runChart} from '../../../../components/charts-engine/runners/chart';
import type {Plugin} from '../../../../components/charts-engine/types';

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
            handler: (
                ctx: AppContext,
                {
                    req,
                    res,
                    config,
                    chartsEngine,
                    configResolving,
                }: {
                    req: Request;
                    res: Response;
                    config: ResolvedConfig;
                    chartsEngine: ChartsEngine;
                    configResolving: number;
                },
            ) => {
                return runChart(ctx, {chartsEngine, req, res, config, configResolving});
            },
        },
    ],
};
