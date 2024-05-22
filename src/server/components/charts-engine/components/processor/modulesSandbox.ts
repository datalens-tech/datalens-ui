import {QuickJSHandle, QuickJSRuntime, shouldInterruptAfterDeadline} from 'quickjs-emscripten';

import {config} from '../../constants';

import {Console} from './console';

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
    modules: QuickJSHandle;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
    runtime: QuickJSRuntime;
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
    runtime: QuickJSRuntime;
    modules: QuickJSHandle;
};

export type ModulesSandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    name: string;
    modules: QuickJSHandle;
    stackTrace?: string;
};

const execute = async ({
    code,
    name,
    isScreenshoter,
    timeout,
    runtime,
    modules,
}: ExecuteParams): Promise<ModulesSandboxExecuteResult> => {
    if (!runtime) {
        throw new Error('Sandbox runtime is not initialized');
    }

    const timeStart = process.hrtime();
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;
    const console = new Console({isScreenshoter});

    try {
        const context = runtime.newContext();
        runtime.setMemoryLimit(1024 * 1024 * 10);
        runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + timeout));

        const logHandle = context.newFunction('log', (...args) => {
            const nativeArgs = args.map(context.dump);
            console.log(...nativeArgs);
        });
        const consoleHandle = context.newObject();
        context.setProp(consoleHandle, 'log', logHandle);
        context.setProp(context.global, 'console', consoleHandle);
        logHandle.dispose();
        consoleHandle.dispose();

        const module = context.newObject();
        context.newObject().consume((exports) => context.setProp(module, 'exports', exports));
        context.setProp(context.global, 'module', module);
        module.dispose();

        context.setProp(context.global, 'modules', modules);

        const prepare = `
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
        const moduleInit = context.evalCode(prepare + code + after);
        context.unwrapResult(moduleInit).dispose();
        context.dispose();
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
        modules,
    };
};

const MODULE_PROCESSING_TIMEOUT = 500;

const processModule = async ({
    name,
    code,
    modules,
    isScreenshoter,
    runtime,
}: ProcessModuleParams) => {
    return execute({
        code,
        isScreenshoter,
        name,
        timeout: MODULE_PROCESSING_TIMEOUT,
        runtime,
        modules,
    });
};

export const Sandbox = {
    processModule,
};
