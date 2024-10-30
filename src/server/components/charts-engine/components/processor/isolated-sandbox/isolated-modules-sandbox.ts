import type IsolatedVM from 'isolated-vm';
import {isString} from 'lodash';

import type {IChartEditor} from '../../../../../../shared';
import {config} from '../../../constants';
import {Console} from '../console';

import type {ChartEditorGetTranslation} from './interop/charteditor-api';
import {requireShim} from './require-shim';
import {SandboxError} from './sandbox';
import {safeStringify} from './utils';

const {RUNTIME_ERROR, RUNTIME_TIMEOUT_ERROR} = config;

type ProcessModuleParams = {
    name: string;
    code: string;
    userLogin: string | null;
    userLang: string;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
    context: IsolatedVM.Context;
    getTranslation: (
        keyset: string,
        key: string,
        params?: Record<string, string | number>,
    ) => string;
};

type ExecuteParams = {
    code: string;
    isScreenshoter: boolean;
    name: string;
    timeout: number;
    context: IsolatedVM.Context;
    chartEditorApi: IChartEditor;
};

export type ModulesSandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    filename: string;
    stackTrace?: string;
};

const execute = async ({
    code,
    name,
    isScreenshoter,
    timeout,
    context,
    chartEditorApi,
}: ExecuteParams): Promise<ModulesSandboxExecuteResult> => {
    if (!context) {
        throw new Error('Sandbox context is not initialized');
    }

    const timeStart = process.hrtime();
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;
    const isolatedConsole = new Console({isScreenshoter});

    const jail = context.global;
    jail.setSync('global', jail.derefInto());

    jail.setSync('__log', function (...args: any[]) {
        isolatedConsole.log(...args);
    });

    jail.setSync('_ChartEditor_getTranslation', ((keyset, key, params) => {
        return chartEditorApi.getTranslation(keyset, key, params);
    }) satisfies ChartEditorGetTranslation);

    try {
        const prepare = `
           const __safeStringify = ${safeStringify.toString()};
           const console = {log: (...args) => { 
                    const processed = args.map(elem => {
                        return __safeStringify(elem, {isConsole: true});
                    })
                    return __log(...processed);
                }
            };
           var module = {exports: {}};
           var exports = module.exports;
           const ChartEditor = {
                getUserLang: () => "${chartEditorApi.getUserLang()}",
                getUserLogin: () => "${chartEditorApi.getUserLogin()}",
                getTranslation: (keyset, key, params) => _ChartEditor_getTranslation(keyset, key, params),
           };

           const require = ${requireShim.toString()};
           `;

        const after = `
            __modules["${name}"] = module.exports
        `;
        const codeWrapper = `(function () { \n ${code} \n })();`;
        context.evalClosureSync(`${prepare}\n ${codeWrapper} \n ${after}`, [], {timeout});
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

    if (errorStackTrace) {
        const error = new SandboxError(RUNTIME_ERROR);

        error.code = errorCode;
        error.executionResult = {
            executionTiming,
            logs: isolatedConsole.getLogs(),
            filename: name,
            stackTrace: errorStackTrace,
        };
        error.stackTrace = errorStackTrace;
        throw error;
    }

    return {
        executionTiming,
        filename: name,
        logs: isolatedConsole.getLogs(),
    };
};

const MODULE_PROCESSING_TIMEOUT = 500;

export const processModule = async ({
    name,
    code,
    userLang,
    userLogin,
    isScreenshoter,
    context,
    getTranslation,
}: ProcessModuleParams) => {
    const chartEditorApi = {
        getTranslation,
        getUserLang: () => userLang,
        getUserLogin: () => userLogin || '',
    };

    return execute({
        code,
        isScreenshoter,
        name,
        timeout: MODULE_PROCESSING_TIMEOUT,
        context,
        chartEditorApi: chartEditorApi as IChartEditor,
    });
};
