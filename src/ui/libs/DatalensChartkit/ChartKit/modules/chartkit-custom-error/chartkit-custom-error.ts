import merge from 'lodash/merge';

import type {CombinedError} from '../../../types';

export const ERROR_CODE = {
    UNKNOWN: 'ERR.CK.UNKNOWN_ERROR',
    UNKNOWN_EXTENSION: 'ERR.CK.UNKNOWN_EXTENSION',
    NO_DATA: 'ERR.CK.NO_DATA',
    TOO_MANY_LINES: 'ERR.CK.TOO_MANY_LINES',
    UI_SANDBOX_EXECUTION_TIMEOUT: 'ERR.CK.UI_SANDBOX_EXECUTION_TIMEOUT',
    UI_SANDBOX_FN_EXECUTION_TIMEOUT: 'ERR.CK.UI_SANDBOX_FN_EXECUTION_TIMEOUT',
};

export type CustomErrorDebugFullArgs = {
    requestId?: string;
    traceId?: string;
    status?: number | null;
    code?: string;
};

interface CustomErrorArgs {
    message?: string;
    code?: number | string;
    details?: object | string;
    debug?: string | CustomErrorDebugFullArgs;
}

export class ChartKitCustomError extends Error implements CustomErrorArgs {
    static isCustomError(error: CombinedError): error is ChartKitCustomError {
        return (error as ChartKitCustomError).isCustomError;
    }

    static wrap(originalError: CombinedError, args: CustomErrorArgs = {}) {
        if (ChartKitCustomError.isCustomError(originalError)) {
            return typeof originalError.extend === 'function'
                ? originalError.extend(args)
                : // There is no extend method in the error from the open source chartkit
                  merge(originalError, args);
        }

        const customError = new ChartKitCustomError(args.message || originalError.message, args);
        customError.name = originalError.name;
        customError.stack = originalError.stack;

        return customError;
    }

    isCustomError: boolean;
    debug: CustomErrorArgs['debug'];
    code: string | number;
    details: {[key: string]: unknown};

    constructor(message?: string | null, args: CustomErrorArgs = {}) {
        const {code = ERROR_CODE.UNKNOWN, details = {}} = args;

        super(message || args.message);

        this.isCustomError = true;

        this.code = code;
        // @ts-ignore
        this.details = details;

        this.debug = args.debug || '';
    }

    extend(args: CustomErrorArgs) {
        return merge(this, args);
    }
}
