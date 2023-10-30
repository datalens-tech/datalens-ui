import vm from 'vm';

import {Keysets, ServerI18n} from '../../../../../i18n/types';
import {initI18n} from '../../../../../i18n/utils';
import {ChartsInsight, DashWidgetConfig} from '../../../../../shared';
import {IChartEditor} from '../../../../../shared/types';
import {keysetsByLang} from '../../../../utils/language';
import {config} from '../../constants';
import {resolveIntervalDate, resolveOperation, resolveRelativeDate} from '../utils';

import {Console} from './console';
import {NativeModule} from './types';

const {
    RUNTIME_ERROR,
    RUNTIME_TIMEOUT_ERROR,
    CONFIG_LOADING_ERROR,
    DEPS_RESOLVE_ERROR,
    ROWS_NUMBER_OVERSIZE,
    DATA_FETCHING_ERROR,
    SEGMENTS_OVERSIZE,
    TABLE_OVERSIZE,
} = config;
const DEFAULT_USER_LANG = 'ru';
const DEFAULT_PROCESSING_TIMEOUT = 500;

function getOrphanedObject() {
    return Object.create(null);
}

const getI18n = (lang: string): ServerI18n => {
    return {
        get lang(): string {
            return lang;
        },

        i18nServer: null,

        getI18nServer() {
            if (!this.i18nServer || this.i18nServer.lang !== this.lang) {
                const data = keysetsByLang()[this.lang] || {content: {}};

                const {I18n: i18nServer} = initI18n({lang: this.lang, content: data.content});
                this.i18nServer = i18nServer;
            }
            return this.i18nServer;
        },

        keyset(keysetName: keyof Keysets) {
            return this.getI18nServer().keyset(keysetName);
        },
    };
};

type GenerateInstanceParams = {
    context?: {
        ChartEditor?: {};
    };
    modules?: Record<string, unknown>;
    userLogin: string | null;
    userLang?: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

type ProcessModuleParams = {
    name: string;
    code: string;
    modules: Record<string, object>;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

type ProcessTabParams = {
    name: string;
    code: string;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data?: Record<string, any>;
    dataStats?: any;
    timeout: number;
    shared: Record<string, object>;
    modules: Record<string, unknown>;
    hooks: Record<string, any>;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

export class SandboxError extends Error {
    code:
        | typeof RUNTIME_ERROR
        | typeof RUNTIME_TIMEOUT_ERROR
        | typeof CONFIG_LOADING_ERROR
        | typeof DEPS_RESOLVE_ERROR
        | typeof ROWS_NUMBER_OVERSIZE
        | typeof DATA_FETCHING_ERROR
        | typeof SEGMENTS_OVERSIZE
        | typeof TABLE_OVERSIZE = RUNTIME_ERROR;
    executionResult?: {
        executionTiming: [number, number];
        filename: string;
        logs: {type: string; value: string}[][];
        stackTrace?: string;
    };
    details?: Record<string, string | number>;
    stackTrace?: string;
}

const generateInstance = ({
    context = {},
    modules = {},
    userLogin,
    userLang = DEFAULT_USER_LANG,
    nativeModules,
    isScreenshoter,
}: GenerateInstanceParams): vm.Context => {
    const moduleObject = getOrphanedObject();
    moduleObject.exports = getOrphanedObject();

    const ChartEditor = getOrphanedObject();
    ChartEditor.getUserLogin = () => userLogin;
    ChartEditor.getUserLang = () => userLang;

    const i18n = getI18n(userLang || DEFAULT_USER_LANG);
    ChartEditor.getTranslation = (
        keyset: string,
        key: string,
        params?: Record<string, string | number>,
    ) => {
        return i18n.keyset(keyset as keyof Keysets)(key, params);
    };

    const instance = {
        module: moduleObject,
        exports: moduleObject.exports,
        console: new Console({isScreenshoter}),
        ChartEditor,
        Set,
        Map,
        require: (name: string) => {
            const lowerName = name.toLowerCase();
            if (nativeModules[lowerName]) {
                const requiredNativeModule = nativeModules[lowerName] as NativeModule;

                if (requiredNativeModule.setConsole) {
                    requiredNativeModule.setConsole(instance.console);
                }

                return requiredNativeModule;
            } else if (modules[lowerName]) {
                return modules[lowerName];
            } else {
                throw new Error(`Module "${lowerName}" is not resolved`);
            }
        },
    };

    const runtimeHelpers = Object.assign(
        getOrphanedObject(),
        instance.ChartEditor,
        context.ChartEditor || getOrphanedObject(),
    );

    const resultingContext = Object.assign(getOrphanedObject(), instance, context);

    resultingContext.ChartEditor = resultingContext.chartEditor = runtimeHelpers;

    return resultingContext;
};

type ExecuteParams = {
    code: string;
    instance: vm.Context;
    filename: string;
    timeout: number;
};

export type SandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    filename: string;
    stackTrace?: string;
    exports: unknown;
    runtimeMetadata: {
        userConfigOverride: Record<string, string>;
        userActionParamsOverride: Record<string, string>;
        libraryConfigOverride: Record<string, string>;
        extra: Record<string, string>;
        dataSourcesInfos: Record<string, string>;
        userParamsOverride?: Record<string, string>;
        error?: Error;
        errorTransformer: <T>(error: T) => T;
        chartsInsights?: ChartsInsight[];
        sideMarkdown?: string;
        exportFilename?: string;
    };
};

const execute = ({code, instance, filename, timeout}: ExecuteParams): SandboxExecuteResult => {
    if (!code && filename === 'JavaScript') {
        const error = new SandboxError('You should provide code in JavaScript tab');
        error.code = RUNTIME_ERROR;
        throw error;
    }

    const timeStart = process.hrtime();
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;

    try {
        vm.runInNewContext(code, instance, {filename, timeout, microtaskMode: 'afterEvaluate'});
    } catch (e) {
        if (typeof e === 'object' && e !== null) {
            errorStackTrace = 'stack' in e && (e.stack as string);

            if ('code' in e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
                errorCode = RUNTIME_TIMEOUT_ERROR;
            }
        } else {
            errorStackTrace = 'Empty stack trace';
        }
    } finally {
        executionTiming = process.hrtime(timeStart);
    }

    delete instance.self;
    const result = {
        executionTiming,
        logs: instance.console.getLogs(),
        filename,
    };

    if (errorStackTrace) {
        const error = new SandboxError(RUNTIME_ERROR);

        error.code = errorCode;
        error.executionResult = {...result, stackTrace: errorStackTrace};
        error.stackTrace = errorStackTrace;
        throw error;
    }

    return {
        ...result,
        exports: instance.module.exports,
        runtimeMetadata: instance.__runtimeMetadata,
    };
};

const processTab = ({
    name,
    code,
    params,
    actionParams,
    widgetConfig,
    data,
    dataStats,
    timeout = DEFAULT_PROCESSING_TIMEOUT,
    shared = {},
    modules = {},
    hooks,
    userLogin,
    userLang,
    nativeModules,
    isScreenshoter,
}: ProcessTabParams) => {
    const api: IChartEditor = {
        getSharedData: () => shared,
        getLang: () => userLang,
        attachHandler: (handlerConfig: Record<string, any>) => ({
            ...handlerConfig,
            __chartkitHandler: true,
        }),
        attachFormatter: (formatterConfig: Record<string, any>) => ({
            ...formatterConfig,
            __chartkitFormatter: true,
        }),
        ...hooks.getSandboxApiMethods(),
    };

    api.resolveRelative = resolveRelativeDate;

    api.resolveInterval = resolveIntervalDate;

    api.resolveOperation = resolveOperation;

    const context = {
        ChartEditor: api,
        __runtimeMetadata: getOrphanedObject(),
    };

    context.__runtimeMetadata.userConfigOverride = getOrphanedObject();
    context.__runtimeMetadata.libraryConfigOverride = getOrphanedObject();
    context.__runtimeMetadata.extra = getOrphanedObject();
    context.__runtimeMetadata.dataSourcesInfos = getOrphanedObject();

    api.setError = (value) => {
        context.__runtimeMetadata.error = value;
    };

    api.setChartsInsights = (value) => {
        context.__runtimeMetadata.chartsInsights = value;
    };

    /** We need for backward compatibility with ≤0.19.2 */
    api._setError = api.setError;

    api.getWidgetConfig = () => widgetConfig || {};

    api.getActionParams = () => actionParams || {};

    if (params) {
        api.getParams = () => params;
        api.getParam = (paramName: string) => params[paramName] || [];
    }

    if (name === 'Urls') {
        api.setErrorTransform = (errorTransformer) => {
            context.__runtimeMetadata.errorTransformer = errorTransformer;
        };
        api.getSortParams = () => {
            const columnId = Array.isArray(params._columnId)
                ? params._columnId[0]
                : params._columnId;
            const order = Array.isArray(params._sortOrder)
                ? params._sortOrder[0]
                : params._sortOrder;
            const _sortRowMeta = Array.isArray(params._sortRowMeta)
                ? params._sortRowMeta[0]
                : params._sortRowMeta;
            const _sortColumnMeta = Array.isArray(params._sortColumnMeta)
                ? params._sortColumnMeta[0]
                : params._sortColumnMeta;

            let meta: Record<string, any>;
            try {
                meta = {
                    column: _sortColumnMeta ? JSON.parse(_sortColumnMeta) : {},
                    row: _sortRowMeta ? JSON.parse(_sortRowMeta) : {},
                };
            } catch {
                meta = {};
            }

            return {columnId, order: Number(order), meta};
        };
    }

    if (name === 'Urls' || name === 'JavaScript') {
        api.getCurrentPage = () => {
            const page = Number(Array.isArray(params._page) ? params._page[0] : params._page);
            return isNaN(page) ? 1 : page;
        };
    }

    if (name === 'Params' || name === 'JavaScript' || name === 'UI' || name === 'Urls') {
        api.updateParams = (updatedParams) => {
            context.__runtimeMetadata.userParamsOverride = Object.assign(
                {},
                context.__runtimeMetadata.userParamsOverride,
                updatedParams,
            );
        };
        api.updateActionParams = (updatedActionParams) => {
            context.__runtimeMetadata.userActionParamsOverride = Object.assign(
                {},
                context.__runtimeMetadata.userActionParamsOverride,
                updatedActionParams,
            );
        };
    }

    if (name === 'UI' || name === 'JavaScript') {
        api.getLoadedData = () => data || {};
        api.getLoadedDataStats = () => dataStats || {};
        api.setDataSourceInfo = (dataSourceKey, info) => {
            context.__runtimeMetadata.dataSourcesInfos[dataSourceKey] = {info};
        };

        if (name === 'JavaScript') {
            api.updateConfig = (updatedFragment) => {
                context.__runtimeMetadata.userConfigOverride = Object.assign(
                    {},
                    context.__runtimeMetadata.userConfigOverride,
                    updatedFragment,
                );
            };
            api.updateHighchartsConfig = (updatedFragment) => {
                context.__runtimeMetadata.libraryConfigOverride = Object.assign(
                    {},
                    context.__runtimeMetadata.libraryConfigOverride,
                    updatedFragment,
                );
            };
            api.updateLibraryConfig = api.updateHighchartsConfig;
            api.setSideHtml = (html) => {
                context.__runtimeMetadata.sideMarkdown = html;
            };
            api.setSideMarkdown = (markdown: string) => {
                context.__runtimeMetadata.sideMarkdown = markdown;
            };
            api.setExtra = (key, value) => {
                context.__runtimeMetadata.extra[key] = value;
            };
            api.setExportFilename = (filename: string) => {
                context.__runtimeMetadata.exportFilename = filename;
            };
        }
    }

    return execute({
        code,
        instance: generateInstance({
            context,
            modules,
            userLogin,
            userLang,
            nativeModules,
            isScreenshoter,
        }),
        filename: name,
        timeout,
    });
};

const MODULE_PROCESSING_TIMEOUT = 500;

const processModule = ({
    name,
    code,
    modules,
    userLogin,
    userLang,
    nativeModules,
    isScreenshoter,
}: ProcessModuleParams) => {
    return execute({
        code,
        instance: generateInstance({
            modules,
            userLogin,
            userLang,
            nativeModules,
            isScreenshoter,
        }),
        filename: name,
        timeout: MODULE_PROCESSING_TIMEOUT,
    });
};

export const Sandbox = {
    processTab,
    processModule,
};
