import {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import {Feature, isEnabledServerFeature} from '../../../../shared';
import {chartGenerator} from '../components/chart-generator';
import {Processor, ProcessorParams} from '../components/processor';
import {getWizardChartBuilder} from '../components/processor/worker-chart-builder';
import {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';

import {RunnerHandler, RunnerHandlerProps} from '.';

export const runWizardChart: RunnerHandler = async (
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

    const hrStart = process.hrtime();

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

    const chartBuilder = await getWizardChartBuilder({
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config: generatedConfig as ResolvedConfig,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
    });
    const processorParams: Omit<ProcessorParams, 'ctx'> = {
        chartsEngine,
        paramsOverride: params,
        actionParamsOverride: actionParams,
        widgetConfig,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        userId: res.locals && res.locals.userId,
        subrequestHeaders: res.locals.subrequestHeaders,
        req,
        iamToken,
        isEditMode: Boolean(res.locals.editMode),
        configResolving,
        cacheToken: req.headers['x-charts-cache-token'] || null,
        builder: chartBuilder,
    };

    if (
        processorParams.subrequestHeaders &&
        typeof processorParams.subrequestHeaders['x-chart-kind'] === 'undefined'
    ) {
        processorParams.subrequestHeaders['x-chart-kind'] = 'editor';
    }

    if (req.body.unreleased === 1) {
        processorParams.useUnreleasedConfig = true;
    }

    if (generatedConfig) {
        processorParams.configOverride = generatedConfig as ResolvedConfig;
    }

    const configWorkbook = workbookId ?? config.workbookId;
    if (configWorkbook) {
        processorParams.workbookId = configWorkbook;
    }

    if (req.body.uiOnly) {
        processorParams.uiOnly = true;
    }

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

    return ctx
        .call('engineProcessing', (cx) => {
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
                            const resultCopy = {...result};

                            if ('_confStorageConfig' in resultCopy) {
                                delete resultCopy._confStorageConfig;
                            }

                            cx.log('PROCESSED_WITH_ERRORS', {error: result.error});

                            let statusCode = 500;

                            if (isObject(result.error) && !showChartsEngineDebugInfo) {
                                const {error} = result;
                                if ('debug' in error) {
                                    delete error.debug;
                                }

                                const {details} = error;

                                if (details) {
                                    delete details.stackTrace;

                                    if (details.sources) {
                                        const {sources} = details;

                                        Object.keys(sources).forEach((source) => {
                                            if (sources[source]) {
                                                const {body} = sources[source];

                                                if (body) {
                                                    delete body.debug;
                                                }
                                            }
                                        });
                                    }
                                }
                            }

                            if (isObject(result.error) && result.error.statusCode) {
                                statusCode = result.error.statusCode;

                                delete result.error.statusCode;
                            }

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
        })
        .catch((error) => {
            ctx.logError('CHARTS_ENGINE_PROCESSOR_UNHANDLED_ERROR', error);
            ctx.end();
            res.status(500).send('Internal error');
        });
};
