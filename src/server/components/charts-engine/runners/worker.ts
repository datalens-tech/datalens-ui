import type {AppContext} from '@gravity-ui/nodekit';

import {chartGenerator} from '../components/chart-generator';
import type {ChartBuilder} from '../components/processor/types';
import type {ChartStorageType} from '../types';

import type {Runners} from './common';
import {commonRunner} from './common';

import type {RunnerHandlerProps, RunnerHandlerResult} from '.';

// eslint-disable-next-line complexity
export const runWorkerChart = async (
    cx: AppContext,
    props: RunnerHandlerProps & {chartBuilder: ChartBuilder; runnerType?: Runners},
): Promise<RunnerHandlerResult> => {
    const {
        chartsEngine,
        req,
        runnerLocals,
        config,
        configResolving,
        workbookId,
        chartBuilder,
        runnerType = 'Worker',
        forbiddenFields,
    } = props;
    let generatedConfig;
    let chartType;
    const {template} = config;

    const ctx = cx.create('templateChartRunner');

    if (config) {
        let result;
        let metadata = null;

        try {
            if (typeof config.data.shared === 'string') {
                const data = JSON.parse(config.data.shared);

                if (!template && !data.type) {
                    data.type = config.meta && config.meta.stype;
                }

                result = chartGenerator.generateChart({
                    data,
                    template,
                    req,
                    ctx,
                });

                metadata = {
                    entryId: config.entryId,
                    key: config.key,
                    owner: config.owner,
                    scope: config.scope,
                };

                chartType = template || data.type;
            } else {
                // This is some kind of legacy edge cases.
                // Just for compatibility purposes;
                const data = config.data.shared as {type: string};

                if (!template && !data.type) {
                    data.type = config.meta && config.meta.stype;
                }

                result = chartGenerator.generateChart({
                    data,
                    template,
                    req,
                    ctx,
                });

                chartType = template || data.type;
            }
        } catch (error) {
            ctx.logError('Failed to generate chart in chart runner', error);
            ctx.end();

            return {
                status: 400,
                payload: error,
            };
        }

        generatedConfig = {
            data: result.chart as Record<string, string>,
            meta: {
                stype: result.type as ChartStorageType,
            },
            publicAuthor: config.publicAuthor,
        };

        if (metadata) {
            Object.assign(generatedConfig, metadata);
        }
    } else {
        const error = new Error('CHART_RUNNER_CONFIG_MISSING');

        ctx.logError('CHART_RUNNER_CONFIG_MISSING', error);
        ctx.end();

        return {
            status: 400,
            payload: error,
        };
    }

    const hrStart = process.hrtime();

    return commonRunner({
        runnerLocals,
        req,
        ctx,
        chartType,
        chartsEngine,
        configResolving,
        builder: chartBuilder,
        generatedConfig,
        workbookId,
        runnerType,
        hrStart,
        localConfig: config,
        forbiddenFields,
    });
};
