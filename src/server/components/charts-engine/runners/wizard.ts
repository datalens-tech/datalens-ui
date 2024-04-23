import {AppContext} from '@gravity-ui/nodekit';

import {Feature, isEnabledServerFeature} from '../../../../shared';
import {chartGenerator} from '../components/chart-generator';
import {Processor, ProcessorParams} from '../components/processor';
import {handleProcessorError} from '../components/processor/utils';
import {getWizardChartBuilder} from '../components/processor/wizard-chart-builder';
import {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';

import {RunnerHandler, RunnerHandlerProps} from '.';

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
        let data;

        try {
            if (typeof config.data.shared === 'string') {
                data = JSON.parse(config.data.shared);
                metadata = {
                    entryId: config.entryId,
                    key: config.key,
                    owner: config.owner,
                    scope: config.scope,
                };
            } else {
                // This is some kind of legacy edge cases.
                // Just for compatibility purposes;
                data = config.data.shared as {type: string};
            }

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

    const hrStart = process.hrtime();

    const userLang = res.locals && res.locals.lang;
    const {params, actionParams, widgetConfig} = req.body;
    const wizardChartBuilder = await getWizardChartBuilder({
        userLang,
        params: params,
        actionParams: actionParams,
        widgetConfig,
        config,
    });
    const processorParams: Omit<ProcessorParams, 'ctx'> = {
        chartsEngine,
        paramsOverride: params,
        actionParamsOverride: actionParams,
        widgetConfig,
        userLang,
        userLogin: res.locals && res.locals.login,
        userId: res.locals && res.locals.userId,
        subrequestHeaders: res.locals.subrequestHeaders,
        req,
        iamToken: res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken],
        isEditMode: Boolean(res.locals.editMode),
        configResolving,
        cacheToken: req.headers['x-charts-cache-token'] || null,
        useUnreleasedConfig: req.body.unreleased === 1,
        configOverride: generatedConfig as ResolvedConfig,
        workbookId: workbookId ?? config.workbookId,
        uiOnly: Boolean(req.body.uiOnly),
        builder: wizardChartBuilder,
    };

    processorParams.responseOptions = req.body.responseOptions || {};
    if (
        processorParams.responseOptions &&
        typeof processorParams.responseOptions.includeLogs === 'undefined'
    ) {
        processorParams.responseOptions.includeLogs = true;
    }

    ctx.log('EditorRunner::PreRun', {duration: getDuration(hrStart)});

    const showChartsEngineDebugInfo = Boolean(
        isEnabledServerFeature(ctx, Feature.ShowChartsEngineDebugInfo),
    );

    ctx.call('engineProcessing', (cx) => {
        return Processor.process({...processorParams, ctx: cx})
            .then((result) => {
                cx.log('EditorRunner::FullRun', {duration: getDuration(hrStart)});

                if (result) {
                    // TODO use ShowChartsEngineDebugInfo flag
                    if (
                        'logs_v2' in result &&
                        (!res.locals.editMode || !showChartsEngineDebugInfo)
                    ) {
                        delete result.logs_v2;
                    }

                    if ('error' in result) {
                        cx.log('PROCESSED_WITH_ERRORS', {error: result.error});

                        const {statusCode} = handleProcessorError(result, {
                            debugInfo: showChartsEngineDebugInfo,
                        });
                        res.status(statusCode).send(result);
                    } else {
                        cx.log('PROCESSED_SUCCESSFULLY');

                        res.status(200).send(result);
                    }
                } else {
                    throw new Error('INVALID_PROCESSING_RESULT');
                }
            })
            .catch((error) => {
                cx.logError('PROCESSING_FAILED', error);

                if (Number(error.statusCode) >= 200 && Number(error.statusCode) < 400) {
                    res.status(500).send({
                        error: {
                            code: 'ERR.CHARTS.INVALID_SET_ERROR_USAGE',
                            message: 'Only 4xx/5xx error status codes valid for .setError',
                        },
                    });
                } else {
                    const result = {
                        error: {
                            ...error,
                            code: error.code || 'ERR.CHARTS.UNHANDLED_ERROR',
                            debug: {
                                message: error.message,
                                ...(error.debug || {}),
                            },
                        },
                    };

                    if (!showChartsEngineDebugInfo) {
                        delete result.error.debug;

                        if (result.error.details) {
                            delete result.error.details.stackTrace;
                        }
                    }

                    res.status(error.statusCode || 500).send(result);
                }
            })
            .finally(() => {
                ctx.end();
            });
    }).catch((error) => {
        ctx.logError('CHARTS_ENGINE_PROCESSOR_UNHANDLED_ERROR', error);
        ctx.end();
        res.status(500).send('Internal error');
    });

    return;
};
