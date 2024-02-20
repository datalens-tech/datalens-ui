import {transformParamsToActionParams} from '@gravity-ui/dashkit';
import {Request} from '@gravity-ui/expresskit';
import {AppContext} from '@gravity-ui/nodekit';
import JSONfn from 'json-fn';
import {isNumber, isObject, isString, merge, mergeWith} from 'lodash';

import {ChartsEngine} from '../..';
import {
    DL_CONTEXT_HEADER,
    DashWidgetConfig,
    EDITOR_TYPE_CONFIG_TABS,
    EntryPublicAuthor,
    Feature,
    WorkbookId,
    isEnabledServerFeature,
} from '../../../../../shared';
import {config as configConstants} from '../../constants';
import {Source} from '../../types';
import {renderHTML} from '../markdown';
import * as Storage from '../storage';
import {ResolvedConfig} from '../storage/types';
import {getDuration, normalizeParams, resolveParams} from '../utils';

import {CommentsFetcher, CommentsFetcherPrepareCommentsParams} from './comments-fetcher';
import {DataFetcher, DataFetcherResult} from './data-fetcher';
import {extractDependencies} from './dependencies';
import {ProcessorHooks} from './hooks';
import {Sandbox, SandboxError, SandboxExecuteResult} from './sandbox';
import {StackTracePreparer} from './stack-trace-prepaper';
import {
    ProcessorErrorResponse,
    ProcessorFiles,
    ProcessorLogs,
    ProcessorSuccessResponse,
    UiTabExports,
    UserConfig,
} from './types';

const {
    CONFIG_LOADING_ERROR,
    CONFIG_TYPE,
    DATA_FETCHING_ERROR,
    DEFAULT_OVERSIZE_ERROR_STATUS,
    DEFAULT_RUNTIME_ERROR_STATUS,
    DEFAULT_RUNTIME_TIMEOUT_STATUS,
    DEFAULT_SOURCE_FETCHING_ERROR_STATUS_400,
    DEFAULT_SOURCE_FETCHING_ERROR_STATUS_500,
    DEFAULT_SOURCE_FETCHING_LIMIT_EXCEEDED_STATUS,
    DEPS_RESOLVE_ERROR,
    HOOKS_ERROR,
    ROWS_NUMBER_OVERSIZE,
    RUNTIME_ERROR,
    RUNTIME_TIMEOUT_ERROR,
    SEGMENTS_OVERSIZE,
    TABLE_OVERSIZE,
    REQUEST_SIZE_LIMIT_EXCEEDED,
    ALL_REQUESTS_SIZE_LIMIT_EXCEEDED,
} = configConstants;

const TEN_SECONDS = 10000;
const ONE_SECOND = 1000;

const getMessageFromUnknownError = (e: unknown) =>
    isObject(e) && 'message' in e && isString(e.message) ? e.message : '';

function collectModulesLogs({
    processedModules,
    logsStorage,
}: {
    processedModules?: Record<string, SandboxExecuteResult>;
    logsStorage: ProcessorLogs;
}) {
    if (!processedModules) {
        return;
    }

    Object.keys(processedModules).forEach((moduleName) => {
        const module = processedModules[moduleName];
        module.logs.forEach((logLine) => {
            logLine.unshift({type: 'string', value: `[${moduleName}]`});
        });
        logsStorage.modules = logsStorage.modules.concat(module.logs);
    });
}

function mergeArrayWithObject(a: [], b: {}) {
    // for example, for xAxis/yAxis, when there is one axis on one side and several on the other
    // typeof === 'object' check in case there is, for example, a string
    if (Array.isArray(a) && b && typeof b === 'object' && !Array.isArray(b)) {
        return a.map((value) => merge(value, b));
    }
    return;
}

function logSandboxDuration(duration: [number, number], filename: string, ctx: AppContext) {
    ctx.log(
        `EditorEngineSandbox::Execution[${filename}]: ${duration[0]}s ${duration[1] / 1000000}ms`,
    );
}

class DepsResolveError extends Error {
    description?: string;
}

export type ProcessorParams = {
    chartsEngine: ChartsEngine;
    subrequestHeaders: Record<string, string>;
    paramsOverride: Record<string, string | string[]>;
    actionParamsOverride: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    configOverride?: {
        data: Record<string, string>;
        key: string;
        entryId?: string;
        type?: string;
        meta: {stype: keyof typeof EDITOR_TYPE_CONFIG_TABS};
        publicAuthor?: EntryPublicAuthor;
    };
    useUnreleasedConfig?: boolean;
    userLogin: string | null;
    userLang: string | null;
    userId: string | null;
    iamToken: string | null;
    req: Request;
    responseOptions?: Record<string, string | boolean>;
    uiOnly?: boolean;
    isEditMode: boolean;
    configResolving: number;
    ctx: AppContext;
    cacheToken: string | string[] | null;
    workbookId?: WorkbookId;
};

export class Processor {
    // eslint-disable-next-line complexity
    static async process({
        chartsEngine,
        subrequestHeaders,
        paramsOverride = {},
        widgetConfig = {},
        configOverride,
        useUnreleasedConfig,
        userLogin = null,
        userLang,
        userId = null,
        iamToken = null,
        req,
        responseOptions = {},
        uiOnly = false,
        isEditMode,
        configResolving,
        ctx,
        workbookId,
    }: ProcessorParams): Promise<
        ProcessorSuccessResponse | ProcessorErrorResponse | {error: string}
    > {
        const configName = req.body.key;
        const configId = req.body.id;

        const logs: ProcessorLogs = {
            modules: [],
        };
        let processedModules: Record<string, SandboxExecuteResult> = {};
        let modulesLogsCollected = false;
        let resolvedSources: Record<string, DataFetcherResult> | undefined;
        let config: ResolvedConfig;
        let params: Record<string, string | string[]>;
        let actionParams: Record<string, string | string[]>;
        let usedParams: Record<string, string | string[]>;
        const hooks = new ProcessorHooks({chartsEngine});
        const timings: {
            configResolving: number;
            dataFetching: null | number;
            jsExecution: null | number;
        } = {
            configResolving,
            dataFetching: null,
            jsExecution: null,
        };

        const onCodeExecuted = chartsEngine.telemetryCallbacks.onCodeExecuted || (() => {});

        function injectConfigAndParams({target}: {target: Record<string, any>}) {
            let responseConfig;
            const useChartsEngineResponseConfig = Boolean(
                isEnabledServerFeature(ctx, Feature.UseChartsEngineResponseConfig),
            );

            if (useChartsEngineResponseConfig && responseOptions.includeConfig && config) {
                responseConfig = config;
            } else {
                responseConfig = {
                    type: config.type,
                    meta: config.meta,
                    entryId: config.entryId,
                    key: config.key,
                };
            }
            responseConfig.key = config.key || configName;
            responseConfig.entryId = config.entryId || configId;

            target._confStorageConfig = responseConfig;

            target.key = responseConfig.key;
            target.id = responseConfig.entryId;
            target.type = responseConfig.type;

            if (params) {
                target.params = params;
            }
            if (actionParams) {
                target.actionParams = actionParams;
            }
        }

        function stringifyLogs(localLogs: ProcessorLogs, localHooks: ProcessorHooks) {
            try {
                const formatter = localHooks.getLogsFormatter();
                return JSON.stringify(localLogs, (_, value: string | number) => {
                    if (typeof value === 'number' && isNaN(value)) {
                        return '__special_value__NaN';
                    }
                    if (value === Infinity) {
                        return '__special_value__Infinity';
                    }
                    if (value === -Infinity) {
                        return '__special_value__-Infinity';
                    }
                    return formatter ? formatter(value) : value;
                });
            } catch (e) {
                ctx.logError('Error during formatting logs', e);

                return '';
            }
        }

        function injectLogs({
            target,
        }: {
            target: ProcessorSuccessResponse | Partial<ProcessorErrorResponse>;
        }) {
            if (responseOptions.includeLogs) {
                target.logs_v2 = stringifyLogs(logs, hooks);
            }
        }

        function updateParams(userParamsOverride: Record<string, string | string[]> | undefined) {
            if (userParamsOverride) {
                Object.keys(userParamsOverride).forEach((key) => {
                    const overridenItem = userParamsOverride[key];

                    if (params[key] && params[key].length > 0) {
                        if (Array.isArray(overridenItem) && overridenItem.length > 0) {
                            params[key] = overridenItem;
                        }
                    } else {
                        params[key] = overridenItem;
                    }

                    usedParams[key] = params[key];
                });
            }
        }

        function updateActionParams(
            userActionParamsOverride: Record<string, string | string[]> | undefined,
        ) {
            if (!userActionParamsOverride) {
                return;
            }
            actionParams = userActionParamsOverride;

            // todo after usedParams has fixed CHARTS-6619
            /*Object.keys(userActionParamsOverride).forEach((key) => {
                const overridenItem = userActionParamsOverride[key];

                if (params[key] && params[key].length > 0) {
                    if (Array.isArray(overridenItem) && overridenItem.length > 0) {
                        params[key] = overridenItem;
                    }
                } else {
                    params[key] = overridenItem;
                }

                usedParams[key] = params[key];
            });*/
        }

        try {
            let hrStart = process.hrtime();

            try {
                config =
                    (configOverride as ResolvedConfig) ||
                    (await Storage.resolveConfig(ctx, {
                        unreleased: useUnreleasedConfig,
                        key: configName,
                        headers: {...subrequestHeaders},
                        requestId: req.id,
                        workbookId,
                    }));
            } catch (e) {
                return {
                    error: {
                        code: CONFIG_LOADING_ERROR,
                        debug: {
                            message: getMessageFromUnknownError(e),
                        },
                    },
                };
            }

            const type = config.meta.stype;

            config.type = type;
            ctx.log('EditorEngine::ConfigResolved', {duration: getDuration(hrStart)});

            const resultHooksInit = await hooks.init({
                req,
                config: {
                    ...config,
                    entryId: config.entryId || configId,
                },
                isEditMode,
                ctx,
            });

            if (resultHooksInit.status === ProcessorHooks.STATUS.FAILED) {
                const {hookError, error} = resultHooksInit;
                if (hookError) {
                    return {
                        error: {
                            code: HOOKS_ERROR,
                            ...hookError,
                        },
                    };
                } else {
                    return {
                        error: {
                            code: HOOKS_ERROR,
                            message: 'Unhandled error init hooks',
                            debug: {
                                message: getMessageFromUnknownError(error),
                            },
                        },
                    };
                }
            }

            hrStart = process.hrtime();

            let resolvedModules: ResolvedConfig[];

            try {
                resolvedModules = await Processor.resolveDependencies({
                    chartsEngine,
                    config,
                    subrequestHeaders,
                    req,
                    ctx,
                    workbookId,
                });
            } catch (error) {
                ctx.logError('DEPS_RESOLVE_ERROR', error);

                if (!isObject(error)) {
                    return {
                        error: {
                            code: DEPS_RESOLVE_ERROR,
                            details: {
                                stackTrace: 'Error resolving required modules: internal error',
                            },
                            debug: {},
                        },
                    };
                }

                let reason = 'internal error';

                if ('status' in error) {
                    if (error.status === 403) {
                        reason = 'access denied';
                    } else if (error.status === 404) {
                        reason = 'not found';
                    }
                }

                const target =
                    'description' in error && error.description
                        ? `module (${error.description})`
                        : 'required modules';

                return {
                    error: {
                        code: DEPS_RESOLVE_ERROR,
                        details: {
                            stackTrace: `Error resolving ${target}: ${reason}`,
                        },
                        statusCode:
                            'status' in error && isNumber(error.status) ? error.status : undefined,
                        debug: {
                            message: getMessageFromUnknownError(error),
                        },
                    },
                };
            }

            ctx.log('EditorEngine::DepsResolved', {duration: getDuration(hrStart)});

            hrStart = process.hrtime();

            processedModules = resolvedModules.reduce<Record<string, SandboxExecuteResult>>(
                (modules, resolvedModule) => {
                    const name = resolvedModule.key;
                    modules[name] = Sandbox.processModule({
                        name,
                        code: resolvedModule.data.js,
                        modules: Object.keys(modules).reduce<Record<string, unknown>>(
                            (acc, moduleName) => {
                                acc[moduleName] = modules[moduleName].exports;
                                return acc;
                            },
                            {},
                        ) as Record<string, object>,
                        userLogin,
                        userLang,
                        nativeModules: chartsEngine.nativeModules,
                        isScreenshoter: Boolean(req.headers['x-charts-scr']),
                    });
                    logSandboxDuration(modules[name].executionTiming, modules[name].filename, ctx);
                    return modules;
                },
                {},
            );

            ctx.log('EditorEngine::DepsProcessed', {duration: getDuration(hrStart)});

            let shared;
            try {
                shared = JSON.parse(config.data.shared || '{}');
            } catch (error) {
                ctx.logError('Error during shared tab parsing', error);

                logs.Shared = [[{type: 'string', value: 'Invalid JSON in Shared tab'}]];

                const failedResponse = {
                    error: {
                        code: RUNTIME_ERROR,
                        details: {
                            description: 'Invalid JSON in Shared tab',
                        },
                        debug: {
                            message: getMessageFromUnknownError(error),
                        },
                    },
                };

                injectLogs({target: failedResponse});

                return failedResponse;
            }

            const modules: Record<string, unknown> = {};
            Object.keys(processedModules).forEach((moduleName) => {
                const module = processedModules[moduleName];
                modules[moduleName] = module.exports;
            });

            const {params: normalizedParamsOverride, actionParams: normalizedActionParamsOverride} =
                normalizeParams(paramsOverride);

            hrStart = process.hrtime();
            const paramsTabResults = Sandbox.processTab({
                name: 'Params',
                code: config.data.params,
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                params: normalizedParamsOverride,
                actionParams: normalizedActionParamsOverride,
                widgetConfig,
                shared,
                modules,
                userLogin,
                userLang,
                isScreenshoter: Boolean(req.headers['x-charts-scr']),
            });
            logSandboxDuration(paramsTabResults.executionTiming, paramsTabResults.filename, ctx);

            const paramsTabError = paramsTabResults.runtimeMetadata.error;
            if (paramsTabError) {
                throw paramsTabError;
            }

            ctx.log('EditorEngine::Params', {duration: getDuration(hrStart)});

            usedParams = {...(paramsTabResults.exports as Record<string, string | string[]>)};

            // Merge used to be here. Merge in this situation does not work as it should for arrays, so assign.
            params = Object.assign({}, usedParams, normalizedParamsOverride);
            actionParams = Object.assign({}, {}, normalizedActionParamsOverride);

            Object.keys(params).forEach((paramName) => {
                const param = params[paramName];
                if (!Array.isArray(param)) {
                    params[paramName] = [param];
                }
            });

            // take values from params in usedParams there are always only defaults exported from the Params tab
            // and in params new passed parameters
            Object.keys(usedParams).forEach((paramName) => {
                usedParams[paramName] = params[paramName];
            });

            // ChartEditor.updateParams() has the highest priority,
            // therefore, now we take the parameters set through this method
            updateParams(paramsTabResults.runtimeMetadata.userParamsOverride);
            updateActionParams(paramsTabResults.runtimeMetadata.userActionParamsOverride);

            logs.Params = paramsTabResults.logs;

            resolveParams(params as Record<string, string[]>);

            hrStart = process.hrtime();
            const sourcesTabResults = Sandbox.processTab({
                name: 'Urls',
                code: config.data.url,
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params,
                actionParams,
                widgetConfig,
                userLogin,
                userLang,
                isScreenshoter: Boolean(req.headers['x-charts-scr']),
            });

            logSandboxDuration(sourcesTabResults.executionTiming, sourcesTabResults.filename, ctx);
            ctx.log('EditorEngine::Urls', {duration: getDuration(hrStart)});
            logs.Urls = sourcesTabResults.logs;

            try {
                hrStart = process.hrtime();

                const sourcesTabError = sourcesTabResults.runtimeMetadata.error;
                if (sourcesTabError) {
                    throw sourcesTabError;
                }

                let sources = sourcesTabResults.exports as Record<string, Source>;
                if (uiOnly) {
                    const filteredSources: Record<string, Source> = {};
                    Object.keys(sources).forEach((key) => {
                        const source = sources[key];
                        if (isObject(source) && source.ui) {
                            filteredSources[key] = source;
                        }
                    });
                    sources = filteredSources;
                }

                if (configOverride?.entryId || configId) {
                    let dlContext: Record<string, string> = {};
                    if (subrequestHeaders[DL_CONTEXT_HEADER]) {
                        const dlContextHeader = req.headers[DL_CONTEXT_HEADER];
                        dlContext = JSON.parse(
                            dlContextHeader && !Array.isArray(dlContextHeader)
                                ? dlContextHeader
                                : '',
                        );
                    }

                    dlContext.chartId = configOverride?.entryId || configId;

                    if (subrequestHeaders['x-chart-kind']) {
                        dlContext.chartKind = subrequestHeaders['x-chart-kind'];
                    }

                    subrequestHeaders[DL_CONTEXT_HEADER] = JSON.stringify(dlContext);
                }

                resolvedSources = await DataFetcher.fetch({
                    chartsEngine,
                    sources,
                    req,
                    iamToken,
                    subrequestHeaders,
                    userId,
                    workbookId,
                });

                if (Object.keys(resolvedSources).length) {
                    timings.dataFetching = getDuration(hrStart);
                }

                ctx.log('EditorEngine::DataFetched', {duration: getDuration(hrStart)});
            } catch (error) {
                ctx.logError('Error fetching sources', error);

                if (!modulesLogsCollected) {
                    collectModulesLogs({logsStorage: logs, processedModules});
                }

                if (!isObject(error)) {
                    return {error: 'Internal fetching error'};
                }

                const response: ProcessorErrorResponse = {
                    error: {
                        code: DATA_FETCHING_ERROR,
                        debug: {
                            message: getMessageFromUnknownError(error),
                            ...('debug' in error && error.debug ? error.debug : {}),
                        },
                    },
                };

                if ('status' in error) {
                    if (error.status === 403) {
                        response.error.code = 'ENTRY_FORBIDDEN';
                    } else if (error.status === 404) {
                        response.error.code = 'ENTRY_NOT_FOUND';
                    }
                }

                const {errorTransformer} = sourcesTabResults.runtimeMetadata;

                if (errorTransformer) {
                    response.error = errorTransformer(response.error);
                }

                injectLogs({target: response});

                if (error instanceof Error) {
                    return {error: 'Internal fetching error'};
                } else if (!response.error.details) {
                    response.error.details = {
                        sources: error,
                    };

                    let maybe400 = false;
                    let maybe500 = false;
                    let requestSizeLimitExceeded = false;
                    Object.values(error).forEach((sourceResult) => {
                        const possibleStatus = sourceResult && sourceResult.status;

                        if (399 < possibleStatus && possibleStatus < 500) {
                            maybe400 = true;
                        } else {
                            maybe500 = true;
                        }

                        if (
                            sourceResult.code === REQUEST_SIZE_LIMIT_EXCEEDED ||
                            sourceResult.code === ALL_REQUESTS_SIZE_LIMIT_EXCEEDED
                        ) {
                            requestSizeLimitExceeded = true;
                        }
                    });

                    if (maybe400 && !maybe500) {
                        response.error.statusCode = DEFAULT_SOURCE_FETCHING_ERROR_STATUS_400;
                    } else if (requestSizeLimitExceeded) {
                        response.error.statusCode = DEFAULT_SOURCE_FETCHING_LIMIT_EXCEEDED_STATUS;
                    } else {
                        response.error.statusCode = DEFAULT_SOURCE_FETCHING_ERROR_STATUS_500;
                    }
                }

                return response;
            }

            const data = Object.keys(resolvedSources).reduce<
                Record<string, DataFetcherResult['body']>
            >((acc, sourceName) => {
                if (resolvedSources) {
                    acc[sourceName] = resolvedSources[sourceName].body;
                    // @ts-ignore body not optional;
                    delete resolvedSources[sourceName].body;
                }
                return acc;
            }, {});

            let libraryTabResult;
            hrStart = process.hrtime();
            if (!uiOnly && config.data.graph) {
                const tabName = type.startsWith('timeseries') ? 'Yagr' : 'Highcharts';
                // Highcharts tab
                libraryTabResult = Sandbox.processTab({
                    name: tabName,
                    code: config.data.graph,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params,
                    actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter: Boolean(req.headers['x-charts-scr']),
                });
            } else if (!uiOnly && config.data.map) {
                // Highcharts tab
                libraryTabResult = Sandbox.processTab({
                    name: 'Highmaps',
                    code: config.data.map,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params,
                    actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter: Boolean(req.headers['x-charts-scr']),
                });
            } else if (!uiOnly && config.data.ymap) {
                // Yandex.Maps tab
                libraryTabResult = Sandbox.processTab({
                    name: 'Yandex.Maps',
                    code: config.data.ymap,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params,
                    actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter: Boolean(req.headers['x-charts-scr']),
                });
            }

            ctx.log('EditorEngine::HighCharts', {duration: getDuration(hrStart)});

            let libraryConfig;
            if (libraryTabResult) {
                logSandboxDuration(
                    libraryTabResult.executionTiming,
                    libraryTabResult.filename,
                    ctx,
                );
                libraryConfig = libraryTabResult.exports || {};
                logs.Highcharts = libraryTabResult.logs;

                const libraryError = libraryTabResult.runtimeMetadata.error;
                if (libraryError) {
                    throw libraryTabResult.runtimeMetadata.error;
                }
            } else {
                libraryConfig = {};
            }

            let userConfig: UserConfig = {};
            let processedData;
            let jsTabResults;
            if (!uiOnly) {
                hrStart = process.hrtime();
                const configTab = EDITOR_TYPE_CONFIG_TABS[type];
                const configTabResults = Sandbox.processTab({
                    name: 'Config',
                    code: config.data[configTab as keyof typeof config.data] || '',
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params,
                    actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter: Boolean(req.headers['x-charts-scr']),
                });

                logSandboxDuration(
                    configTabResults.executionTiming,
                    configTabResults.filename,
                    ctx,
                );
                ctx.log('EditorEngine::Config', {duration: getDuration(hrStart)});

                logs.Config = configTabResults.logs;
                userConfig = configTabResults.exports as UserConfig;

                hrStart = process.hrtime();
                jsTabResults = Sandbox.processTab({
                    name: 'JavaScript',
                    code: config.data.js || 'module.exports = {};',
                    timeout: TEN_SECONDS,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params,
                    actionParams,
                    widgetConfig,
                    data,
                    dataStats: resolvedSources,
                    userLogin,
                    userLang,
                    hooks,
                    isScreenshoter: Boolean(req.headers['x-charts-scr']),
                });
                logSandboxDuration(jsTabResults.executionTiming, jsTabResults.filename, ctx);

                timings.jsExecution = getDuration(hrStart);

                const hrEnd = process.hrtime();
                const hrDuration = [hrEnd[0] - hrStart[0], hrEnd[1] - hrStart[1]];

                onCodeExecuted({
                    id: `${config.entryId}:${config.key}`,
                    requestId: req.id,
                    latency: (hrDuration[0] * 1e9 + hrDuration[1]) / 1e6,
                });

                ctx.log('EditorEngine::JS', {duration: getDuration(hrStart)});

                processedData = jsTabResults.exports as Record<string, any>;
                logs.JavaScript = jsTabResults.logs;

                const jsError = jsTabResults.runtimeMetadata.error;
                if (jsError) {
                    throw jsError;
                }

                // ChartEditor.updateParams() has the highest priority,
                // so now we take the parameters set through this method
                updateParams(jsTabResults.runtimeMetadata.userParamsOverride);
            }

            const uiTabResults = Sandbox.processTab({
                name: 'UI',
                code: config.data.ui || '',
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params,
                actionParams,
                widgetConfig,
                data,
                userLogin,
                userLang,
                isScreenshoter: Boolean(req.headers['x-charts-scr']),
            });
            logSandboxDuration(uiTabResults.executionTiming, uiTabResults.filename, ctx);

            const uiTabExports = uiTabResults.exports;
            let uiScheme: UiTabExports | null = null;

            if (
                uiTabExports &&
                (Array.isArray(uiTabExports) ||
                    (isObject(uiTabExports) &&
                        'controls' in uiTabExports &&
                        Array.isArray(uiTabExports.controls)))
            ) {
                uiScheme = uiTabExports as UiTabExports;
            }

            logs.UI = uiTabResults.logs;
            ctx.log('EditorEngine::UI', {duration: getDuration(hrStart)});

            // ChartEditor.updateParams() has the highest priority,
            // so now we take the parameters set through this method
            updateParams(uiTabResults.runtimeMetadata.userParamsOverride);

            if (uiScheme && userConfig && !userConfig.overlayControls) {
                userConfig.notOverlayControls = true;
            }

            collectModulesLogs({processedModules, logsStorage: logs});
            modulesLogsCollected = true;

            const normalizedDefaultParams = normalizeParams(
                paramsTabResults.exports as ProcessorSuccessResponse['defaultParams'],
            );
            const result: ProcessorSuccessResponse = {
                sources: resolvedSources,
                uiScheme,
                params: {...params, ...transformParamsToActionParams(actionParams)},
                usedParams,
                actionParams,
                widgetConfig,
                defaultParams: normalizedDefaultParams.params,
                extra: {},
                timings,
            };

            injectLogs({target: result});

            if (!uiOnly && jsTabResults) {
                result.data = processedData;
                const resultConfig = merge(
                    {},
                    userConfig,
                    jsTabResults.runtimeMetadata.userConfigOverride,
                );

                const stringify = isEnabledServerFeature(ctx, Feature.NoJsonFn)
                    ? JSON.stringify
                    : JSONfn.stringify;

                result.config = stringify(resultConfig);
                result.publicAuthor = config.publicAuthor;

                result.highchartsConfig = stringify(
                    mergeWith(
                        {},
                        libraryConfig,
                        jsTabResults.runtimeMetadata.libraryConfigOverride,
                        (a, b) => {
                            return mergeArrayWithObject(a, b) || mergeArrayWithObject(b, a);
                        },
                    ),
                );
                result.extra = jsTabResults.runtimeMetadata.extra;
                result.extra.chartsInsights = jsTabResults.runtimeMetadata.chartsInsights;
                result.extra.sideMarkdown = jsTabResults.runtimeMetadata.sideMarkdown;

                result.sources = merge(
                    resolvedSources,
                    jsTabResults.runtimeMetadata.dataSourcesInfos,
                );

                if (jsTabResults.runtimeMetadata.exportFilename) {
                    result.extra.exportFilename = jsTabResults.runtimeMetadata.exportFilename;
                }

                ctx.log('EditorEngine::Postprocessing', {duration: getDuration(hrStart)});

                if (
                    chartsEngine.flags.chartComments &&
                    (type === CONFIG_TYPE.GRAPH_NODE ||
                        type === CONFIG_TYPE.GRAPH_WIZARD_NODE ||
                        type === CONFIG_TYPE.GRAPH_QL_NODE)
                ) {
                    try {
                        const chartName =
                            type === CONFIG_TYPE.GRAPH_NODE || type === CONFIG_TYPE.GRAPH_QL_NODE
                                ? configName
                                : configId;

                        hrStart = process.hrtime();

                        result.comments = await CommentsFetcher.prepareComments(
                            {
                                chartName,
                                config: resultConfig.comments,
                                data: result.data as CommentsFetcherPrepareCommentsParams['data'],
                                params,
                            },
                            subrequestHeaders,
                            ctx,
                        );

                        ctx.log('EditorEngine::Comments', {duration: getDuration(hrStart)});
                    } catch (error) {
                        ctx.logError('Error preparing comments', error);
                    }
                }

                if (type === CONFIG_TYPE.MARKDOWN_NODE) {
                    try {
                        if (!(result.data?.markdown || result.data?.html)) {
                            throw Error('Empty markdown or html');
                        }
                        const markdown = result.data.markdown || result.data.html;
                        const html = renderHTML({
                            text: markdown || '',
                            lang: userLang || '',
                        });
                        delete result.data.markdown;
                        result.data.html = html.result;
                    } catch (error) {
                        ctx.logError('Error render markdown', error);
                    }
                }
            }

            injectConfigAndParams({target: result});

            return result;
        } catch (error) {
            ctx.logError('Run failed', error);

            const isError = (error: unknown): error is SandboxError => {
                return isObject(error);
            };

            if (!isError(error)) {
                throw error;
            }

            const executionResult: {
                filename?: string;
                logs?: {type: string; value: string}[][];
                stackTrace?: string;
                stack?: string;
            } = error.executionResult || {};
            if (!modulesLogsCollected) {
                collectModulesLogs({logsStorage: logs, processedModules});
            }

            const failedLogs = executionResult.logs;
            if (failedLogs) {
                logs[(executionResult.filename as ProcessorFiles) || 'failed'] = failedLogs;
            }

            const result: Partial<ProcessorErrorResponse> = {};

            injectLogs({target: result});

            switch (error.code) {
                case CONFIG_LOADING_ERROR:
                case DEPS_RESOLVE_ERROR:
                case DATA_FETCHING_ERROR:
                    result.error = error;
                    break;

                case ROWS_NUMBER_OVERSIZE:
                case SEGMENTS_OVERSIZE:
                case TABLE_OVERSIZE:
                    result.error = {
                        code: error.code,
                        details: error.details,
                        statusCode: DEFAULT_OVERSIZE_ERROR_STATUS,
                    };
                    break;

                case RUNTIME_ERROR:
                    executionResult.stackTrace =
                        executionResult.stackTrace || executionResult.stack;

                    if (resolvedSources) {
                        result.sources = resolvedSources;
                    }

                    result.error = {
                        code: RUNTIME_ERROR,
                        details: {
                            stackTrace: executionResult.stackTrace
                                ? StackTracePreparer.prepare(executionResult.stackTrace)
                                : '',
                            tabName: error.executionResult ? error.executionResult.filename : '',
                        },
                        statusCode: DEFAULT_RUNTIME_ERROR_STATUS,
                    };

                    break;
                case RUNTIME_TIMEOUT_ERROR:
                    result.error = {
                        code: RUNTIME_TIMEOUT_ERROR,
                        statusCode: DEFAULT_RUNTIME_TIMEOUT_STATUS,
                    };

                    break;
                default:
                    throw error;
            }

            const tabName = (error.executionResult && error.executionResult.filename) || 'script';
            const message = `EXECUTION_ERROR Error processing ${tabName}\n${error.stackTrace}`;

            ctx.log(message, {
                stackTrace: error.stackTrace,
                tabName,
            });

            return {
                error: result.error,
                logs_v2: result.logs_v2,
                sources: result.sources,
            };
        }
    }

    static async resolveDependencies({
        chartsEngine,
        config,
        subrequestHeaders,
        req,
        ctx,
        workbookId,
    }: {
        chartsEngine: ChartsEngine;
        subrequestHeaders: Record<string, string>;
        config: {data: Record<string, string>; key: string};
        req: Request;
        ctx: AppContext;
        workbookId?: WorkbookId;
    }): Promise<ResolvedConfig[]> {
        const code = Object.keys(config.data).reduce((acc, tabName) => {
            return `${acc}\n${config.data[tabName]}`;
        }, '');

        const deps = extractDependencies({code});

        const modulesDeps: Record<string, string[]> = {};
        const fetchedModules: Record<string, ResolvedConfig> = {};

        async function resolveDeps(depsList: string[]): Promise<ResolvedConfig[]> {
            const filteredDepsList = depsList.filter(
                (dep) => !Object.keys(chartsEngine.nativeModules).includes(dep),
            );

            const uniqDeps = Array.from(new Set(filteredDepsList.map((dep) => dep)));
            const depsPromises = uniqDeps.map(async (name) => {
                // eslint-disable-next-line prefer-const
                let [path, version] = name.split('@');

                const unreleased = version === 'saved';

                if (!/^\//.test(path)) {
                    path = `/${path}`;
                }

                const resolvedConfig = (await Storage.resolveConfig(ctx, {
                    unreleased,
                    headers: {...subrequestHeaders},
                    key: path,
                    requestId: req.id,
                    workbookId, // for the future, when we will resolve deps by entryId
                })) as unknown as ResolvedConfig;

                resolvedConfig.key = name;

                return resolvedConfig;
            });

            ctx.log('CE_RESOLVING_DEPS', {depsList});
            const resolvedModules = await Promise.all(depsPromises);

            const modulesToFetch = new Set<string>();
            resolvedModules.forEach((module) => {
                module.key = module.key.toLowerCase();
                const name = module.key;
                if (module.meta.stype !== 'module') {
                    const errorText = `required script "${name}" is not a module`;
                    const moduleTypeError = new DepsResolveError(errorText);
                    moduleTypeError.description = errorText;

                    throw moduleTypeError;
                }
                fetchedModules[name] = module;
                const moduleCode =
                    isObject(module.data) && 'js' in module.data ? module.data.js : '';
                modulesDeps[name] = extractDependencies({
                    code: isString(moduleCode) ? moduleCode : '',
                });
                modulesDeps[name].forEach((moduleName) => modulesToFetch.add(moduleName));
                ctx.log('CE_DEPS_EXTRACTED', {
                    moduleName: name,
                    deps: modulesDeps[name],
                });
            });

            modulesToFetch.forEach((name) => {
                if (fetchedModules[name]) {
                    modulesToFetch.delete(name);
                }
            });
            const fetchList = Array.from(modulesToFetch);

            if (fetchList.length) {
                ctx.log('CE_FETCHING_MODULES', {modules: fetchList});
                return resolveDeps(fetchList);
            } else {
                ctx.log('CE_ALL_DEPS_RESOLVED');
                return Object.keys(fetchedModules).reduce<ResolvedConfig[]>((acc, moduleName) => {
                    acc.push(fetchedModules[moduleName]);
                    return acc;
                }, []);
            }
        }

        const resolvedModules = await resolveDeps(deps);
        ctx.log('CE_RESULTING_DEPS', {modulesDeps});

        // Check for circular dependency and setup execution order
        const levels: Record<string, number> = {};
        const inProgress = {[config.key]: true};

        if (!Object.keys(deps).length) {
            return [];
        }

        function getModuleLevel(name: string) {
            const moduleDeps = modulesDeps[name] || [];

            if (levels[name]) {
                return levels[name];
            } else if (inProgress[name] || moduleDeps.includes(name)) {
                const errorText = `cyclic dependencies in module "${name}"`;
                const depsResolveError = new DepsResolveError(errorText);
                depsResolveError.description = errorText;

                throw depsResolveError;
            } else {
                inProgress[name] = true;
                let maxLevel = 0;

                moduleDeps.forEach((depsName: string) => {
                    const dependencyLevel = getModuleLevel(depsName);
                    if (dependencyLevel >= maxLevel) {
                        maxLevel = dependencyLevel + 1;
                    }
                });
                inProgress[name] = false;
                levels[name] = maxLevel;
                return levels[name];
            }
        }

        resolvedModules.forEach((module) => {
            if (!levels[module.key]) {
                levels[module.key] = getModuleLevel(module.key);
            }
        });

        return resolvedModules.sort((a, b) => levels[a.key] - levels[b.key]);
    }
}
