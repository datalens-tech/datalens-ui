import type {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import {ControlType, Feature, isEnabledServerFeature} from '../../../../shared';
import type {ProcessorParams} from '../components/processor';
import {Processor} from '../components/processor';
import {getControlBuilder} from '../components/processor/control-builder';
import type {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';

import {runChart} from './chart';
import {prepareErrorForLogger} from './utils';

import type {RunnerHandler, RunnerHandlerProps} from '.';

export const runControl: RunnerHandler = async (cx: AppContext, props: RunnerHandlerProps) => {
    if (!isEnabledServerFeature(cx, Feature.ControlBuilder)) {
        return runChart(cx, props);
    }

    const {chartsEngine, req, res, config, configResolving, workbookId} = props;

    const ctx = cx.create('templateControlRunner');

    if (
        !config ||
        !('data' in config) ||
        !('shared' in config.data) ||
        config.meta?.stype !== ControlType.Dash
    ) {
        const error = new Error('CONTROL_RUNNER_CONFIG_MISSING');
        ctx.logError('CONTROL_RUNNER_CONFIG_MISSING', error);
        ctx.end();

        return res.status(400).send({
            error,
        });
    }

    const generatedConfig = {
        data: {
            js: '',
            documentation_en: '',
            documentation_ru: '',
            ui: '',
            url: '',
            graph: '',
            params: '',
            statface_graph: '',
            shared: config.data.shared,
        },
        meta: {
            stype: ControlType.Dash,
        },
        publicAuthor: config.publicAuthor,
    } as ResolvedConfig;

    const hrStart = process.hrtime();

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

    const controlBuilder = await getControlBuilder({
        config: generatedConfig,
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
        builder: controlBuilder,
    };

    if (generatedConfig) {
        processorParams.configOverride = generatedConfig;
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

    ctx.log('ControlRunner::PreRun', {duration: getDuration(hrStart)});

    const showChartsEngineDebugInfo = Boolean(
        isEnabledServerFeature(ctx, Feature.ShowChartsEngineDebugInfo),
    );

    return ctx
        .call('engineProcessing', (cx) => {
            return Processor.process({...processorParams, ctx: cx})
                .then((result) => {
                    cx.log('ControlRunner::FullRun', {duration: getDuration(hrStart)});

                    res.setHeader('chart-runner-type', 'controls');

                    if (result) {
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

                            const logError = prepareErrorForLogger(result.error);

                            cx.log('PROCESSED_WITH_ERRORS', {error: logError});

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
                                code: 'ERR.CONTROLS.INVALID_SET_ERROR_USAGE',
                                message: 'Only 4xx/5xx error status codes valid for .setError',
                            },
                        });
                    } else {
                        const result = {
                            error: {
                                ...error,
                                code: error.code || 'ERR.CONTROLS.UNHANDLED_ERROR',
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
            ctx.logError('CHARTS_ENGINE_PROCESSOR_CONTROL_UNHANDLED_ERROR', error);
            ctx.end();
            res.status(500).send('Internal error');
        });
};
