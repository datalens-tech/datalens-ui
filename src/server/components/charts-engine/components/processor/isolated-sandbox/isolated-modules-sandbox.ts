import type IsolatedVM from 'isolated-vm';
import {isString} from 'lodash';

import type {IChartEditor} from '../../../../../../shared';
import {getTranslationFn} from '../../../../../../shared/modules/language';
import {createI18nInstance} from '../../../../../utils/language';
import {config} from '../../../constants';
import {Console} from '../console';

import {
    libsControlV1Interop,
    libsDatalensV3Interop,
    libsDatasetV2Interop,
    libsQlChartV1Interop,
} from './interop';
import {requireShim} from './requireShim';
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
                getUserLogin: () => "${chartEditorApi.getUserLogin()}"
                getTranslation: (keyset, key, params) => _ChartEditor_getTranslation(keyset, key, params),
           };
           
           ${libsControlV1Interop.prepareAdapter};
           ${libsDatalensV3Interop.prepareAdapter};
           ${libsQlChartV1Interop.prepareAdapter}
           ${libsDatasetV2Interop.prepareAdapter}

           const require = ${requireShim.toString()};
           `;

        libsDatalensV3Interop.setPrivateApi({jail, chartEditorApi});
        libsControlV1Interop.setPrivateApi({jail, chartEditorApi});
        libsQlChartV1Interop.setPrivateApi({jail, chartEditorApi});
        libsDatasetV2Interop.setPrivateApi({jail, chartEditorApi});

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
}: ProcessModuleParams) => {
    const i18n = createI18nInstance({lang: userLang || DEFAULT_USER_LANG});
    const chartEditorApi = {
        getTranslation: getTranslationFn(i18n.getI18nServer()),
        getUserLang: () => userLang || DEFAULT_USER_LANG,
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
