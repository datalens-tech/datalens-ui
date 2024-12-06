import merge from 'lodash/merge';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import {i18n} from '../../../../../i18n';
import type {StringParams} from '../../../../../shared';
import {SHARED_URL_OPTIONS} from '../../../../../shared';
import type {CombinedError} from '../../types';
import {isAxiosError} from '../axios/axios';
import {
    REQUEST_ID_HEADER,
    SERVER_TRACE_ID_HEADER,
    TRACE_ID_HEADER,
    URL_OPTIONS,
} from '../constants/constants';

const ERROR_CODE = {
    UNKNOWN: 'ERR.CK.UNKNOWN_ERROR',

    UNKNOWN_ERROR: 'ERR.CK.UNKNOWN_ERROR',

    UNKNOWN_EXTENSION: 'ERR.CK.UNKNOWN_EXTENSION',

    NETWORK: 'ERR.CK.NETWORK_ERROR',

    UNAUTHORIZED: 'ERR.CK.UNAUTHORIZED',

    DATA_PROVIDER_ERROR: 'ERR.CK.DATA_PROVIDER_ERROR',

    NO_DATA: 'ERR.CK.NO_DATA',
    TOO_MANY_LINES: 'ERR.CK.TOO_MANY_LINES',
    UI_SANDBOX_EXECUTION_TIMEOUT: 'ERR.CK.UI_SANDBOX_EXECUTION_TIMEOUT',
    UI_SANDBOX_FN_EXECUTION_TIMEOUT: 'ERR.CK.UI_SANDBOX_FN_EXECUTION_TIMEOUT',
};

export interface ExtraParams {
    hideRetry?: boolean;
    hideDebugInfo?: boolean;
    openedMore?: boolean;
    actionText?: string;
    actionData?: {params: StringParams};
    showMore?: boolean;
    showErrorMessage?: boolean;
    [key: string]: unknown;
}

interface CustomErrorArgs {
    message?: string;
    code?: number | string;
    details?: object;
    debug?: object;
    extra?: ExtraParams;
}

const PROPS = ['message', 'code', 'details', 'debug', 'extra'];

class DatalensChartkitCustomError extends Error implements CustomErrorArgs {
    static isCustomError(error: CombinedError): error is DatalensChartkitCustomError {
        return (error as DatalensChartkitCustomError).isCustomError;
    }

    static wrap(originalError: CombinedError, args: CustomErrorArgs = {}) {
        if (DatalensChartkitCustomError.isCustomError(originalError)) {
            return typeof originalError.extend === 'function'
                ? originalError.extend(args)
                : // There is no extend method in the error from the open source chartkit
                  merge(originalError, args);
        }

        const customError = new DatalensChartkitCustomError(
            args.message || originalError.message,
            args,
        );
        customError.name = originalError.name;
        customError.stack = originalError.stack;

        if (isAxiosError(originalError) && originalError.response) {
            const {
                data = {},
                headers: {
                    [REQUEST_ID_HEADER]: requestId,
                    [TRACE_ID_HEADER]: traceId,
                    [SERVER_TRACE_ID_HEADER]: serverTraceId,
                },
                status,
                statusText,
            } = originalError.response;

            merge(customError, pick(omit(data as {}, 'message'), PROPS), {
                debug: {
                    requestId,
                    traceId,
                    serverTraceId,
                    status,
                    statusText,
                },
            });
        }

        return customError;
    }

    isCustomError: boolean;

    code: string | number;
    details: {[key: string]: unknown};
    debug: {
        requestId?: string;
        status?: number;
        traceId?: string;
        serverTraceId?: string;
        statusText?: string;
        [key: string]: unknown;
    };

    extra: ExtraParams;

    constructor(message?: string | null, args: CustomErrorArgs = {}) {
        const {code = ERROR_CODE.UNKNOWN, details = {}, debug = {}, extra = {}} = args;

        super(message || args.message);

        this.isCustomError = true;

        this.code = code;
        // @ts-ignore
        this.details = details;
        // @ts-ignore
        this.debug = debug;

        // @ts-ignore
        this.extra = extra;
        this.stack = undefined;
    }

    extend(args: CustomErrorArgs) {
        return merge(this, args);
    }
}

function formatError({
    error: originalError,
    requestId,
    traceId,
    noControls,
}: {
    error: CombinedError;
    requestId?: string;
    traceId?: string;
    noControls?: boolean;
}) {
    let extra: ExtraParams = {
        hideRetry: noControls,
        openedMore: noControls,
        actionText: i18n('chartkit.custom-error', 'retry'),
    };

    if (DatalensChartkitCustomError.isCustomError(originalError)) {
        let message = originalError.message || i18n('chartkit.custom-error', 'error');
        const code = originalError.code;
        const details = originalError.details;
        const debug = Object.assign({requestId, traceId}, originalError.debug);
        extra = Object.assign(extra, originalError.extra);

        switch (originalError.code) {
            case ERROR_CODE.UNKNOWN_EXTENSION:
                message = i18n('chartkit.custom-error', 'error-unknown-extension');
                extra.hideRetry = false;
                break;
            case ERROR_CODE.DATA_PROVIDER_ERROR: {
                message = i18n('chartkit.custom-error', 'error-data-provider');
                break;
            }
            case ERROR_CODE.NO_DATA:
                message = i18n('chartkit.custom-error', 'error-no-data');
                extra.hideDebugInfo = true;
                extra.hideRetry = true;
                break;
            case ERROR_CODE.TOO_MANY_LINES:
                message = i18n('chartkit.custom-error', 'error-too-many-lines');
                Object.assign(extra, {
                    actionText: i18n('chartkit.custom-error', 'draw-anyway'),
                    actionData: {params: {[URL_OPTIONS.WITHOUT_LINE_LIMIT]: 1}},
                    hideDebugInfo: true,
                    rowsExceededLimit: true,
                });
                break;
            case ERROR_CODE.UI_SANDBOX_EXECUTION_TIMEOUT: {
                message = i18n('chartkit.custom-error', 'error-ui-sandbox-timeout');
                Object.assign(extra, {
                    actionText: i18n('chartkit.custom-error', 'draw-anyway'),
                    actionData: {params: {[SHARED_URL_OPTIONS.WITHOUT_UI_SANDBOX_LIMIT]: 1}},
                    hideDebugInfo: true,
                });
                break;
            }
            case ERROR_CODE.UI_SANDBOX_FN_EXECUTION_TIMEOUT: {
                extra.hideRetry = true;
                break;
            }
            case ERROR_CODE.UNKNOWN_ERROR:
                if (debug.status === 504) {
                    message = i18n('chartkit.custom-error', 'error-timeout');
                }

                break;
        }

        extra.hideRetry = noControls || extra.hideRetry;

        return DatalensChartkitCustomError.wrap(originalError, {
            code,
            message,
            details,
            debug,
            extra,
        });
    }

    const customError = new DatalensChartkitCustomError(i18n('chartkit.custom-error', 'error'), {
        code: ERROR_CODE.UNKNOWN,
        details: {message: originalError.message},
        debug: {requestId, traceId},
        extra,
    });
    customError.stack = originalError.stack;

    return customError;
}

export default DatalensChartkitCustomError;

export {ERROR_CODE, formatError};
