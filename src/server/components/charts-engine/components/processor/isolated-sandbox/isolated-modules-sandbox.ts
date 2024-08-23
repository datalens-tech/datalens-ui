import type IsolatedVM from 'isolated-vm';

import {config} from '../../../constants';
import {Console} from '../console';

import {safeStringify} from './utils';

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

type ProcessModuleParams = {
    name: string;
    code: string;
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
        logs: {type: string; value: string}[][];
        stackTrace?: string;
    };
    details?: Record<string, string | number>;
    stackTrace?: string;
    sandboxVersion = 2;
}

type ExecuteParams = {
    code: string;
    userLang: string | null;
    isScreenshoter: boolean;
    name: string;
    timeout: number;
    context: IsolatedVM.Context;
    isolatedConsole: Console;
};

export type ModulesSandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    filename: string;
    stackTrace?: string;
};

const execute = async ({
    code,
    userLang = DEFAULT_USER_LANG,
    name,
    isScreenshoter,
    timeout,
    context,
    isolatedConsole,
}: ExecuteParams): Promise<ModulesSandboxExecuteResult> => {
    if (!context) {
        throw new Error('Sandbox context is not initialized');
    }

    const timeStart = process.hrtime();
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;
    const console = new Console({isScreenshoter});

    const jail = context.global;
    jail.setSync('global', jail.derefInto());

    jail.setSync('__log', function (...args: any[]) {
        isolatedConsole.log(...args);
    });

    try {
        const prepare = `
           const __safeStringify = ${safeStringify.toString()};
           const console = {log: (...args) => { 
                    const processed = args.map(elem => {
                        return __safeStringify(elem);
                    })
                    return __log(...processed);
                }
            };
           var module = {exports: {}};
           var exports = module.exports;
           const ChartEditor = {
                getUserLang: () => "${userLang}"
           };
           
           function require(name) {
               const lowerName = name.toLowerCase();
               if (__modules[lowerName]) {
                   return __modules[lowerName];
               } else {
                   throw new Error(\`Module "\${lowerName}" is not resolved\`);
               }
           };
           `;

        const after = `
            __modules["${name}"] = module.exports
        `;
        const codeWrapper = `(function () { \n ${code} \n })();`;
        context.evalClosureSync(`${prepare}\n ${codeWrapper} \n ${after}`, [], {timeout});
    } catch (e) {
        if (typeof e === 'object' && e !== null) {
            errorStackTrace = 'message' in e && (e.message as string);

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
            logs: console.getLogs(),
            filename: name,
            stackTrace: errorStackTrace,
        };
        error.stackTrace = errorStackTrace;
        throw error;
    }

    return {
        executionTiming,
        filename: name,
        logs: console.getLogs(),
    };
};

const MODULE_PROCESSING_TIMEOUT = 500;

export const processModule = async ({
    name,
    code,
    userLang,
    isScreenshoter,
    context,
}: ProcessModuleParams) => {
    return execute({
        code,
        userLang,
        isScreenshoter,
        name,
        timeout: MODULE_PROCESSING_TIMEOUT,
        context,
        isolatedConsole: new Console({isScreenshoter}),
    });
};
