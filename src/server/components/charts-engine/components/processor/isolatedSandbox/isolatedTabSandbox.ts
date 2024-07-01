import type IsolatedVM from 'isolated-vm';

import {type DashWidgetConfig} from '../../../../../../shared';
import type {IChartEditor, Shared} from '../../../../../../shared/types';
import type {ServerChartsConfig} from '../../../../../../shared/types/config/wizard';
import {config} from '../../../constants';
import type {RuntimeMetadata} from '../types';

import {getChartApiContext} from './../chart-api-context';
import {Console} from './../console';
import type {LogItem} from './../console';
import {
    libsControlV1Interop,
    libsDatalensV3Interop,
    libsDatasetV2Interop,
    libsQlChartV1Interop,
} from './interop';
import {prepareChartEditorApi} from './interop/chartEditorApi';
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
const DEFAULT_PROCESSING_TIMEOUT = 500;

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

type ExecuteParams = {
    code: string;
    filename: string;
    timeout: number;
    context: IsolatedVM.Context;
    chartEditorApi: IChartEditor;
    runtimeMetadata: RuntimeMetadata;
    isolatedConsole: Console;
    userLogin: string | null;
};

export type SandboxExecuteResult = {
    executionTiming: [number, number];
    logs: LogItem[][];
    filename: string;
    stackTrace?: string;
    exports: unknown;
    runtimeMetadata: RuntimeMetadata;
    shared: Record<string, object> | Shared | ServerChartsConfig;
    params: Record<string, string | string[]>;
};

const execute = async ({
    code,
    filename,
    timeout,
    context,
    chartEditorApi,
    runtimeMetadata,
    isolatedConsole,
    userLogin,
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
        isolatedConsole.log(...args);
    });

    try {
        prepareChartEditorApi({
            name: filename,
            jail,
            chartEditorApi,
            userLogin,
        });

        libsDatalensV3Interop.setPrivateApi({jail, chartEditorApi});
        libsControlV1Interop.setPrivateApi({jail, chartEditorApi});
        libsQlChartV1Interop.setPrivateApi({jail, chartEditorApi});
        libsDatasetV2Interop.setPrivateApi({jail, chartEditorApi});
        timeStart = process.hrtime();

        const responseStringify = `
            return JSON.stringify({module}, function(key, val) {
                if (typeof val === 'function') {
                    return val.toString();
                }
                return val;
            });`;

        sandboxResult = context.evalClosureSync(prepare + code + responseStringify, [], {
            timeout,
        });
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

    const shared = chartEditorApi.getSharedData ? chartEditorApi.getSharedData() : {};
    const params = chartEditorApi.getParams ? chartEditorApi.getParams() : {};

    //delete instance.self;

    if (errorStackTrace) {
        const error = new SandboxError(RUNTIME_ERROR);

        error.code = errorCode;
        error.executionResult = {
            executionTiming,
            logs: isolatedConsole.getLogs(),
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
        logs: isolatedConsole.getLogs(),
        filename,
        exports: sandboxResult.module?.exports,
        runtimeMetadata,
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
        filename: name,
        timeout,
        context,
        runtimeMetadata: chartApiContext.__runtimeMetadata,
        chartEditorApi: chartApiContext.ChartEditor,
        isolatedConsole: new Console({isScreenshoter}),
        userLogin,
    });

    Object.assign(originalShared, result.shared);
    Object.assign(originalParams, result.params);

    return result;
};
