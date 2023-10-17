import {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import {Feature, isEnabledServerFeature} from '../../../../shared';
import {Processor, ProcessorParams} from '../components/processor';
import {getDuration} from '../components/utils';

import {RunnerHandlerProps} from '.';

export const runEditor = (
    parentContext: AppContext,
    {chartsEngine, req, res, config, configResolving}: RunnerHandlerProps,
) => {
    const ctx = parentContext.create('editorChartRunner');

    const hrStart = process.hrtime();

    const {params, actionParams} = req.body;

    const processorParams: Omit<ProcessorParams, 'ctx'> = {
        chartsEngine,
        paramsOverride: params,
        actionParamsOverride: actionParams,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        userId: res.locals && res.locals.userId,
        subrequestHeaders: res.locals.subrequestHeaders,
        req,
        iamToken: res.locals && res.locals.iamToken,
        isEditMode: Boolean(res.locals.editMode),
        configResolving,
        cacheToken: req.headers['x-charts-cache-token'] || null,
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

    if (config) {
        processorParams.configOverride = config;
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
    }).catch((error) => {
        ctx.logError('CHARTS_ENGINE_PROCESSOR_UNHANDLED_ERROR', error);
        ctx.end();
        res.status(500).send('Internal error');
    });
};
