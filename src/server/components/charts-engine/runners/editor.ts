import type {AppContext} from '@gravity-ui/nodekit';
import {isObject} from 'lodash';

import type {DashWidgetConfig} from '../../../../shared';
import {Feature, isEnabledServerFeature} from '../../../../shared';
import type {ProcessorParams} from '../components/processor';
import {Processor} from '../components/processor';
import {getIsolatedSandboxChartBuilder} from '../components/processor/isolated-sandbox/isolated-sandbox-chart-builder';
import {getSandboxChartBuilder} from '../components/processor/sandbox-chart-builder';
import {getDuration} from '../components/utils';

import {runServerlessEditor} from './serverlessEditor';
import {prepareErrorForLogger} from './utils';

import type {RunnerHandlerProps} from '.';

const NEW_SANDBOX_PERCENT = {
    [Feature.NewSandbox_1p]: 0.01,
    [Feature.NewSandbox_10p]: 0.1,
    [Feature.NewSandbox_33p]: 0.33,
    [Feature.NewSandbox_50p]: 0.5,
    [Feature.NewSandbox_75p]: 0.75,
};

function isEnabledNewSandboxByDefault(ctx: AppContext) {
    if (isEnabledServerFeature(ctx, Feature.NewSandbox_100p)) {
        return true;
    }
    const features = Object.keys(NEW_SANDBOX_PERCENT);
    const feature = features.find((feat) => isEnabledServerFeature(ctx, feat as Feature));
    if (!feature) {
        return false;
    }
    const percent = NEW_SANDBOX_PERCENT[feature as keyof typeof NEW_SANDBOX_PERCENT];
    return Math.random() <= percent;
}

async function getChartBuilder({
    parentContext,
    userLang,
    userLogin,
    widgetConfig,
    config,
    isScreenshoter,
    chartsEngine,
    isWizard,
}: {
    parentContext: AppContext;
    userLang: string;
    userLogin: string;
    chartsEngine: RunnerHandlerProps['chartsEngine'];
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    config: RunnerHandlerProps['config'];
    isScreenshoter: boolean;
    isWizard: boolean;
}) {
    let sandboxVersion = config.meta.sandbox_version || '0';

    if (sandboxVersion === '0') {
        sandboxVersion = isEnabledNewSandboxByDefault(parentContext) ? '2' : '1';
    }
    const enableIsolatedSandbox =
        Boolean(isEnabledServerFeature(parentContext, Feature.EnableIsolatedSandbox)) &&
        sandboxVersion === '2';

    const noJsonFn = Boolean(isEnabledServerFeature(parentContext, Feature.NoJsonFn));
    const disableErrorTransformer = Boolean(
        isEnabledServerFeature(parentContext, Feature.NoErrorTransformer),
    );
    const chartBuilder =
        enableIsolatedSandbox && !isWizard
            ? await getIsolatedSandboxChartBuilder({
                  userLang,
                  userLogin,
                  widgetConfig,
                  config,
                  isScreenshoter,
                  chartsEngine,
                  features: {
                      noJsonFn,
                  },
              })
            : await getSandboxChartBuilder({
                  userLang,
                  userLogin,
                  widgetConfig,
                  config,
                  isScreenshoter,
                  chartsEngine,
                  disableErrorTransformer,
              });

    return {chartBuilder, sandboxVersion: enableIsolatedSandbox ? 2 : 1};
}

export const runEditor = async (
    parentContext: AppContext,
    runnerHandlerProps: RunnerHandlerProps,
) => {
    const enableServerlessEditor = Boolean(
        isEnabledServerFeature(parentContext, Feature.EnableServerlessEditor),
    );

    if (!runnerHandlerProps.isWizard && enableServerlessEditor) {
        return runServerlessEditor(parentContext, runnerHandlerProps);
    }

    const {chartsEngine, req, res, config, configResolving, workbookId} = runnerHandlerProps;
    const ctx = parentContext.create('editorChartRunner');

    const hrStart = process.hrtime();

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

    const {chartBuilder, sandboxVersion} = await getChartBuilder({
        parentContext,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        chartsEngine,
        isWizard: runnerHandlerProps.isWizard || false,
    });

    ctx.log(`EditorRunner::Sandbox version: ${sandboxVersion}`);

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

    if (config) {
        processorParams.configOverride = config;
    }

    if (workbookId) {
        processorParams.workbookId = workbookId;
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

                        const logError = prepareErrorForLogger(result.error);

                        cx.log('PROCESSED_WITH_ERRORS', {error: {...logError, sandboxVersion}});

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
