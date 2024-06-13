import type IsolatedVM from 'isolated-vm';

import {config} from '../../../constants';

import {Console} from './../console';

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
}

type ExecuteParams = {
    code: string;
    isScreenshoter: boolean;
    name: string;
    timeout: number;
    context: IsolatedVM.Context;
};

export type ModulesSandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    name: string;
    stackTrace?: string;
};

const execute = async ({
    code,
    name,
    isScreenshoter,
    timeout,
    context,
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

    jail.setSync('log', function (...args: any[]) {
        console.log(...args);
    });

    try {
        const prepare = `
           const console = {log};
           const modules = {};
           function require(name) => {
               const lowerName = name.toLowerCase();
               if (modules[lowerName]) {
                   return extractedModules[lowerName];
               } else {
                   throw new Error(\`Module "\${lowerName}" is not resolved\`);
               }
           };
           `;

        const after = ` modules[${name}] = module.exports`;
        context.evalSync(prepare + code + after, {timeout});
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
        name,
        logs: console.getLogs(),
    };
};

const MODULE_PROCESSING_TIMEOUT = 500;

export const processModule = async ({name, code, isScreenshoter, context}: ProcessModuleParams) => {
    return execute({
        code,
        isScreenshoter,
        name,
        timeout: MODULE_PROCESSING_TIMEOUT,
        context,
    });
};
