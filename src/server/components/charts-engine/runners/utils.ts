import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import type {ControlType, EntryPublicAuthor, WorkbookId} from '../../../../shared';
import {Feature, isEnabledServerFeature} from '../../../../shared';
import type {ProcessorParams} from '../components/processor';
import {Processor} from '../components/processor';
import type {ChartBuilder} from '../components/processor/types';
import type {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';
import {config} from '../constants';
import type {ChartsEngine} from '../index';
import type {ChartStorageType} from '../types';

const {DATA_FETCHING_ERROR} = config;

export function prepareErrorForLogger(error: unknown) {
    if (isObject(error) && 'code' in error && error.code === DATA_FETCHING_ERROR) {
        let errorDetails = {};

        if (
            'details' in error &&
            isObject(error.details) &&
            'sources' in error.details &&
            isObject(error.details.sources)
        ) {
            const sources = error.details.sources;
            errorDetails = Object.keys(sources).map((key) => {
                const source = (sources as Record<string, Record<string, unknown>>)[key];
                const body = 'body' in source && isObject(source.body) ? source.body : {};
                return {
                    [key]: {
                        sourceType: source.sourceType,
                        status: source.status,
                        body: {
                            message: 'message' in body ? body.message : undefined,
                            code: 'code' in body ? body.code : undefined,
                        },
                    },
                };
            });
        }

        return {
            code: DATA_FETCHING_ERROR,
            message: 'message' in error ? error.message : 'Data fetching error',
            statusCode: 'statusCode' in error ? error.statusCode : undefined,
            details: errorDetails,
        };
    }
    return isObject(error) ? error : {error};
}

export type Runners = 'Worker' | 'Wizard' | 'Ql' | 'Editor' | 'Control';

function engineProcessingCallback({
    cx,
    ctx,
    hrStart,
    res,
    processorParams,
    runnerType,
}: {
    cx: AppContext;
    ctx: AppContext;
    hrStart: [number, number];
    res: Response;
    processorParams: Omit<ProcessorParams, 'ctx'>;
    runnerType: Runners;
}) {
    const showChartsEngineDebugInfo = Boolean(
        isEnabledServerFeature(ctx, Feature.ShowChartsEngineDebugInfo),
    );

    return Processor.process({...processorParams, ctx: cx})
        .then((result) => {
            cx.log(`${runnerType}::FullRun`, {duration: getDuration(hrStart)});

            res.setHeader('chart-runner-type', runnerType);

            if (result) {
                // TODO use ShowChartsEngineDebugInfo flag
                if ('logs_v2' in result && (!res.locals.editMode || !showChartsEngineDebugInfo)) {
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
}

export function commonRunner({
    res,
    req,
    ctx,
    chartType,
    chartsEngine,
    configResolving,
    builder,
    generatedConfig,
    workbookId,
    localConfig,
    runnerType,
    hrStart,
    subrequestHeadersKind,
}: {
    res: Response;
    req: Request;
    ctx: AppContext;
    chartType?: string;
    chartsEngine: ChartsEngine;
    configResolving: number;
    builder: ChartBuilder;
    generatedConfig: {
        data: Record<string, string>;
        meta: {
            stype: ChartStorageType | ControlType.Dash;
        };
        publicAuthor?: EntryPublicAuthor;
    };
    localConfig?: ResolvedConfig;
    workbookId?: WorkbookId;
    runnerType: Runners;
    hrStart: [number, number];
    subrequestHeadersKind?: string;
}) {
    res.locals.subrequestHeaders['x-chart-kind'] = chartType;

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

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
        builder,
    };

    if (req.body.unreleased === 1) {
        processorParams.useUnreleasedConfig = true;
    }

    if (generatedConfig) {
        processorParams.configOverride = generatedConfig;
    }

    const configWorkbook = workbookId ?? localConfig?.workbookId;
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

    if (
        subrequestHeadersKind &&
        processorParams.subrequestHeaders &&
        typeof processorParams.subrequestHeaders['x-chart-kind'] === 'undefined'
    ) {
        processorParams.subrequestHeaders['x-chart-kind'] = subrequestHeadersKind;
    }

    ctx.log(`${runnerType}::PreRun`, {duration: getDuration(hrStart)});

    return ctx
        .call('engineProcessing', (cx) => {
            return engineProcessingCallback({
                cx,
                ctx,
                hrStart,
                res,
                processorParams,
                runnerType: runnerType as Runners,
            });
        })
        .catch((error) => {
            ctx.logError('CHARTS_ENGINE_PROCESSOR_UNHANDLED_ERROR', error);
            ctx.end();
            res.status(500).send('Internal error');
        });
}
