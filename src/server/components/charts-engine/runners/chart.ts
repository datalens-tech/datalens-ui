import type {AppContext} from '@gravity-ui/nodekit';

import {chartGenerator} from '../components/chart-generator';
import type {ResolvedConfig} from '../components/storage/types';

import {runEditor} from './editor';

import type {RunnerHandler, RunnerHandlerProps} from '.';

export const runChart: RunnerHandler = async (
    cx: AppContext,
    {chartsEngine, req, res, config, configResolving, workbookId}: RunnerHandlerProps,
) => {
    let generatedConfig;

    const {template} = config;

    let chartType;

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

            return res.status(400).send({
                error,
            });
        }

        generatedConfig = {
            data: result.chart,
            meta: {
                stype: result.type,
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

        return res.status(400).send({
            error,
        });
    }

    res.locals.subrequestHeaders['x-chart-kind'] = chartType;

    ctx.end();

    return runEditor(cx, {
        chartsEngine,
        req,
        res,
        config: generatedConfig as ResolvedConfig,
        configResolving,
        workbookId: workbookId ?? config.workbookId,
        isWizard: true,
    });
};
