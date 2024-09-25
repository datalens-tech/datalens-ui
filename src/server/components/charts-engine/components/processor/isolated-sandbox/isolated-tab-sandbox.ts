import type IsolatedVM from 'isolated-vm';
import {isString} from 'lodash';

import type {DashWidgetConfig} from '../../../../../../shared';
import {getTranslationFn} from '../../../../../../shared/modules/language';
import type {IChartEditor, Shared} from '../../../../../../shared/types';
import type {ServerChartsConfig} from '../../../../../../shared/types/config/wizard';
import {createI18nInstance} from '../../../../../utils/language';
import {config} from '../../../constants';
import {getChartApiContext} from '../chart-api-context';
import {Console} from '../console';
import type {LogItem} from '../console';
import type {ProcessorHooks} from '../hooks';
import type {RuntimeMetadata} from '../types';

import {prepareChartEditorApi} from './interop/charteditor-api';
import {getPrepare} from './prepare';

const DEFAULT_USER_LANG = 'ru';
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
    usedParams?: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data?: Record<string, unknown>;
    dataStats?: unknown;
    timeout: number;
    shared: Record<string, object> | Shared | ServerChartsConfig;
    hooks: ProcessorHooks;
    userLogin: string | null;
    userLang: string | null;
    isScreenshoter: boolean;
    context: IsolatedVM.Context;
    features: {
        noJsonFn: boolean;
    };
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
    sandboxVersion = 2;
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
    features: {
        noJsonFn: boolean;
    };
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
    usedParams: Record<string, string | string[]>;
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
    features,
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

    let sandboxResult = {module: {exports: undefined}, __shared: {}, __params: {}};
    let resultParams = {};
    let resultUsedParams = {};

    const jail = context.global;
    jail.setSync('global', jail.derefInto());

    jail.setSync('__log', function (...args: unknown[]): void {
        isolatedConsole.log(...args);
    });

    jail.setSync('__timeout', timeout);
    try {
        timeStart = process.hrtime();
        if (filename === 'Params') {
            const params = chartEditorApi.getParams();
            context.evalClosureSync(`__params = $0 || {};`, [params], {
                arguments: {
                    copy: true,
                },
            });
        }

        // Replace API functions with isolated function invocation
        // eslint-disable-next-line no-param-reassign
        chartEditorApi.updateParams = (params) => {
            context.evalClosureSync(`
                const updatedParams = JSON.parse('${JSON.stringify(params)}');
                 __runtimeMetadata.userParamsOverride = Object.assign(
                    {},
                    __runtimeMetadata.userParamsOverride,
                    updatedParams,
                );
            `);
        };

        prepareChartEditorApi({
            name: filename,
            jail,
            chartEditorApi,
            userLogin,
        });

        const after = `
            ${
                filename === 'Params'
                    ? `
                __usedParams = {...module.exports};
                // Merge used to be here. Merge in this situation does not work as it should for arrays, so assign.    
                __params = Object.assign({}, __usedParams, __params);
                
                Object.keys(__params).forEach((paramName) => {
                    const param = __params[paramName];
                    if (!Array.isArray(param)) {
                        __params[paramName] = [param];
                    }
                });
                // take values from params in usedParams there are always only defaults exported from the Params tab
                // and in params new passed parameters
                Object.keys(__usedParams).forEach((paramName) => {
                    __usedParams[paramName] = __params[paramName];
                });
                // ChartEditor.updateParams() has the highest priority,
                // therefore, now we take the parameters set through this method
                __updateParams({
                    userParamsOverride: __runtimeMetadata.userParamsOverride,
                    params: __params,
                    usedParams: __usedParams,
                });
                __resolveParams(__params);
            `
                    : ``
            };
             ${
                 filename === 'JavaScript' || filename === 'UI'
                     ? `__updateParams({
                            userParamsOverride: __runtimeMetadata.userParamsOverride,
                            params: __params,
                            usedParams: __usedParams,
                        });`
                     : ``
             };
            const jsonFn = ${filename !== 'JavaScript'};
            module = __safeStringify(module, {jsonFn});
            return {module, __shared};
        `;
        const prepare = getPrepare({noJsonFn: features.noJsonFn, name: filename});
        const codeWrapper = `(function () { \n ${code} \n })();`;
        sandboxResult = context.evalClosureSync(`${prepare}\n ${codeWrapper} \n${after}`, [], {
            timeout,
            filename,
            lineOffset: -prepare.split('\n').length - 1,
            result: {
                copy: true,
            },
        });
        resultParams = JSON.parse(context.evalSync('JSON.stringify(__params)'));
        resultUsedParams = JSON.parse(context.evalSync('JSON.stringify(__usedParams)'));
    } catch (e) {
        if (typeof e === 'object' && e !== null) {
            errorStackTrace = 'stack' in e && (e.stack as string);
            errorStackTrace =
                isString(errorStackTrace) &&
                errorStackTrace.split('at (<isolated-vm boundary>)')[0].split('at execute')[0];
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

    let shared = chartEditorApi.getSharedData ? chartEditorApi.getSharedData() : {};

    if (sandboxResult.__shared) {
        shared = {...shared, ...sandboxResult.__shared};
    }

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
        params: resultParams,
        usedParams: resultUsedParams,
        shared,
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
    usedParams,
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
    features,
}: ProcessTabParams) => {
    const originalParams = params;
    const originalUsedParams = usedParams;
    const originalShared = shared;
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

    const i18n = createI18nInstance({lang: userLang || DEFAULT_USER_LANG});
    chartApiContext.ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());
    chartApiContext.ChartEditor.getUserLang = () => userLang || DEFAULT_USER_LANG;
    chartApiContext.ChartEditor.getUserLogin = () => userLogin || '';

    const result = await execute({
        code,
        filename: name,
        timeout,
        context,
        runtimeMetadata: chartApiContext.__runtimeMetadata,
        chartEditorApi: chartApiContext.ChartEditor,
        isolatedConsole: new Console({isScreenshoter}),
        userLogin,
        features,
    });
    Object.assign(originalShared, result.shared);
    Object.assign(originalParams, result.params);
    if (originalUsedParams) {
        Object.assign(originalUsedParams, result.usedParams);
    }
    return result;
};
