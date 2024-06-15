import type IsolatedVM from 'isolated-vm';

import type {ChartsInsight, DashWidgetConfig} from '../../../../../../shared';
import {getTranslationFn} from '../../../../../../shared/modules/language';
import type {Shared} from '../../../../../../shared/types';
import type {ServerChartsConfig} from '../../../../../../shared/types/config/wizard';
import {createI18nInstance} from '../../../../../utils/language';
import {config} from '../../../constants';

import {getChartApiContext} from './../chart-api-context';
import {Console} from './../console';
import type {LogItem} from './../console';
import {getSortParams} from './../paramsUtils';
import {
    libsControlV1Interop,
    libsDatalensV3Interop,
    libsDatasetV2Interop,
    libsQlChartV1Interop,
} from './interop';
import {prepare} from './prepare';
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

type GenerateInstanceParams = {
    context?: {
        ChartEditor?: {};
    };
    userLogin: string | null;
    userLang?: string | null;
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
    shared: Record<string, object> | Shared | ServerChartsConfig;
    hooks: Record<string, any>;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
    context: IsolatedVM.Context;
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
        logs: LogItem[][];
        stackTrace?: string;
    };
    details?: Record<string, string | number>;
    stackTrace?: string;
}

const generateInstance = ({
    context = {},
    userLogin,
    userLang = DEFAULT_USER_LANG,
    isScreenshoter,
}: GenerateInstanceParams): NodeJS.Dict<any> => {
    const moduleObject = getOrphanedObject();
    moduleObject.exports = getOrphanedObject();

    const ChartEditor = getOrphanedObject();
    ChartEditor.getUserLogin = () => userLogin;
    ChartEditor.getUserLang = () => userLang;

    const i18n = createI18nInstance({lang: userLang || DEFAULT_USER_LANG});
    ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

    const instance = {
        console: new Console({isScreenshoter}),
        ChartEditor,
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
    instance: NodeJS.Dict<any>;
    filename: string;
    timeout: number;
    context: IsolatedVM.Context;
};

export type SandboxExecuteResult = {
    executionTiming: [number, number];
    logs: LogItem[][];
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
    shared: Record<string, object> | Shared | ServerChartsConfig;
    params: Record<string, string | string[]>;
};

const execute = async ({
    code,
    instance,
    filename,
    timeout,
    context,
}: ExecuteParams): Promise<SandboxExecuteResult> => {
    if (!code && filename === 'JavaScript') {
        const error = new SandboxError('You should provide code in JavaScript tab');
        error.code = RUNTIME_ERROR;
        throw error;
    }

    let timeStart;
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;

    let sandboxResult: any;

    const jail = context.global;
    jail.setSync('global', jail.derefInto());

    jail.setSync('log', function (...args: any[]) {
        instance.console.log(...args);
    });

    try {
        prepareChartEditorApi({
            name: filename,
            jail,
            shared: instance.ChartEditor.getSharedData
                ? instance.ChartEditor.getSharedData()
                : null,
            loadedData: instance.ChartEditor.getLoadedData
                ? instance.ChartEditor.getLoadedData()
                : null,
            params: instance.ChartEditor.getParams ? instance.ChartEditor.getParams() : null,
            actionParams: instance.ChartEditor.getActionParams
                ? instance.ChartEditor.getActionParams()
                : null,
            widgetConfig: instance.ChartEditor.getWidgetConfig
                ? instance.ChartEditor.getWidgetConfig()
                : null,
            ChartEditor: instance.ChartEditor,
        });

        libsDatalensV3Interop.setPrivateApi({jail, chartEditorApi: instance.ChartEditor});
        libsControlV1Interop.setPrivateApi({jail, chartEditorApi: instance.ChartEditor});
        libsQlChartV1Interop.setPrivateApi({jail, chartEditorApi: instance.ChartEditor});
        libsDatasetV2Interop.setPrivateApi({jail, chartEditorApi: instance.ChartEditor});
        timeStart = process.hrtime();

        sandboxResult = context.evalClosureSync(
            prepare + code + ` return JSON.stringify({module});`,
            [],
            {
                timeout,
            },
        );
        sandboxResult = JSON.parse(sandboxResult);
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
        jail.deleteSync('log');
        executionTiming = process.hrtime(timeStart);
    }

    const shared = instance.ChartEditor.getSharedData ? instance.ChartEditor.getSharedData() : null;
    const params = instance.ChartEditor.getParams ? instance.ChartEditor.getParams() : null;

    delete instance.self;

    if (errorStackTrace) {
        const error = new SandboxError(RUNTIME_ERROR);

        error.code = errorCode;
        error.executionResult = {
            executionTiming,
            logs: instance.console.getLogs(),
            filename,
            stackTrace: errorStackTrace,
        };
        error.stackTrace = errorStackTrace;
        throw error;
    }

    return {
        shared,
        params,
        executionTiming,
        logs: instance.console.getLogs(),
        filename,
        exports: sandboxResult.module?.exports,
        runtimeMetadata: instance.__runtimeMetadata,
    };
};
export const processTab = async ({
    name,
    code,
    params,
    actionParams,
    widgetConfig,
    data,
    dataStats,
    timeout = DEFAULT_PROCESSING_TIMEOUT,
    shared = {},
    hooks,
    userLogin,
    userLang,
    nativeModules,
    isScreenshoter,
    context,
}: ProcessTabParams) => {
    const originalShared = shared;
    const originalParams = params;
    const chartApiContext = getChartApiContext({
        name,
        params,
        actionParams,
        widgetConfig,
        data,
        dataStats,
        shared,
        hooks,
        userLang,
    });

    const result = await execute({
        code,
        instance: generateInstance({
            context: chartApiContext,
            userLogin,
            userLang,
            nativeModules,
            isScreenshoter,
        }),
        filename: name,
        timeout,
        context,
    });

    Object.assign(originalShared, result.shared);
    Object.assign(originalParams, result.params);

    return result;
};

function prepareChartEditorApi({
    name,
    jail,
    shared,
    loadedData,
    params,
    widgetConfig,
    actionParams,
    ChartEditor,
}: {
    name: string;
    jail: IsolatedVM.Reference;
    shared: Record<string, object>;
    loadedData: Record<string, any> | null;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig: DashWidgetConfig['widgetConfig'];
    ChartEditor: NodeJS.Dict<any>;
}) {
    jail.setSync('_shared', JSON.stringify(shared));
    jail.setSync('_params', JSON.stringify(params));
    jail.setSync('_actionParams', JSON.stringify(actionParams));
    jail.setSync('_widgetConfig', JSON.stringify(widgetConfig));

    if (name === 'Urls') {
        jail.setSync('_getSortParams', JSON.stringify(getSortParams(params)));
    }

    if (name === 'Urls' || name === 'JavaScript') {
        const page = Number(Array.isArray(params._page) ? params._page[0] : params._page);
        jail.setSync('_getCurrentPage', isNaN(page) ? 1 : page);
    }

    if (name === 'UI' || name === 'JavaScript') {
        jail.setSync('_getLoadedData', JSON.stringify(loadedData));
        if (name === 'JavaScript') {
            jail.setSync('_ChartEditor_updateHighchartsConfig', (updatedFragment: string) => {
                const parsedUpdatedFragment = JSON.parse(updatedFragment);
                ChartEditor.updateHighchartsConfig(parsedUpdatedFragment);
            });
        }
    }
    return jail;
}
