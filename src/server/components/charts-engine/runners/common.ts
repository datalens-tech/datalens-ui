import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import type {ControlType, EntryPublicAuthor, WorkbookId} from '../../../../shared';
import {
    DISABLE,
    DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME,
    DL_EMBED_TOKEN_HEADER,
    Feature,
    isEnabledServerFeature,
} from '../../../../shared';
import type {ProcessorParams} from '../components/processor';
import {Processor} from '../components/processor';
import type {ChartBuilder} from '../components/processor/types';
import type {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';
import type {ChartsEngine} from '../index';
import type {ChartStorageType} from '../types';

import {prepareErrorForLogger} from './utils';

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
                if (
                    'logs_v2' in result &&
                    (!processorParams.isEditMode || !showChartsEngineDebugInfo)
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
    forbiddenFields,
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
    forbiddenFields?: ProcessorParams['forbiddenFields'];
}) {
    res.locals.subrequestHeaders['x-chart-kind'] = chartType;

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

    const configName = req.body.key;
    const configId = req.body.id;
    const disableJSONFnByCookie = req.cookies[DISABLE_JSONFN_SWITCH_MODE_COOKIE_NAME] === DISABLE;

    const isEmbed = req.headers[DL_EMBED_TOKEN_HEADER] !== undefined;

    const zitadelParams = ctx.config.isZitadelEnabled
        ? {
              accessToken: req.user?.accessToken,
              serviceUserAccessToken: req.serviceUserAccessToken,
          }
        : undefined;

    const originalReqHeaders = {
        xRealIP: req.headers['x-real-ip'],
        xForwardedFor: req.headers['x-forwarded-for'],
        xChartsFetcherVia: req.headers['x-charts-fetcher-via'],
        referer: req.headers.referer,
    };
    const adapterContext = {
        headers: {
            ['x-forwarded-for']: req.headers['x-forwarded-for'],
            cookie: req.headers.cookie,
        },
    };

    const hooksContext = {
        headers: {
            cookie: req.headers.cookie,
            authorization: req.headers.authorization,
        },
    };

    const processorParams: Omit<ProcessorParams, 'ctx'> = {
        chartsEngine,
        paramsOverride: params,
        actionParamsOverride: actionParams,
        widgetConfig,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        userId: res.locals && res.locals.userId,
        subrequestHeaders: res.locals.subrequestHeaders,
        iamToken,
        isEditMode: Boolean(res.locals.editMode),
        configResolving,
        cacheToken: req.headers['x-charts-cache-token'] || null,
        builder,
        forbiddenFields,
        configName,
        configId,
        disableJSONFnByCookie,
        isEmbed,
        zitadelParams,
        originalReqHeaders,
        adapterContext,
        hooksContext,
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
            res.status(500).send('Internal error');
        })
        .finally(() => {
            ctx.end();
        });
}
