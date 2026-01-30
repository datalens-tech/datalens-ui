import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {isAxiosError} from 'axios';
import isObject from 'lodash/isObject';
import {REQUEST_ID_HEADER, TRACE_ID_HEADER} from 'shared';
import {isManualError} from 'utils/errors/manual';

import {DL} from '../../constants';
import type {
    ChartKitCustomError,
    CustomErrorDebugFullArgs,
} from '../../libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {isOperationError, isSdkError} from '../../libs/schematic-sdk';
import type {DataLensApiError, ParsedError, RtkQueryError} from '../../typings';

function isCustomError(error: DataLensApiError): error is ChartKitCustomError {
    return Boolean((error as Error & {isCustomError?: boolean}).isCustomError);
}

// eslint-disable-next-line complexity
export function parseError(apiError: DataLensApiError) {
    const error = isObject(apiError) ? apiError : ({} as DataLensApiError);
    let status: number | null = null;
    let requestId: string = DL.REQUEST_ID;
    let message = '';
    let details: Record<string, string> = {};
    let code = '';
    let debug: unknown;
    let traceId: string | undefined;
    let stack: string | undefined;

    if (isManualError(error)) {
        status = error.status || null;
        message = error.message || '';
        code = error.code || '';
        details = (error.details || {}) as Record<string, string>;
        debug = (error.debug || {}) as Record<string, string>;
    } else if (isSdkError(error)) {
        status = error.status;
        requestId = error.requestId;
        traceId = error.traceId;
        message = error.message;
        details = (error.details || {}) as Record<string, string>;
        code = error.code;
    } else if (isOperationError(error)) {
        status = error.status;
        message = error.message;
        details = (error.details || {}) as Record<string, string>;
        code = error.code;
    } else if (isAxiosError(error)) {
        const {message: errorMessage, response} = error;
        status = response?.status ?? null;
        requestId = response?.headers?.[REQUEST_ID_HEADER] || DL.REQUEST_ID;
        traceId = response?.headers?.[TRACE_ID_HEADER];
        message = response?.data?.message || errorMessage;
        details =
            (response?.data?.details as Record<string, string>) || ({} as Record<string, string>);
        code = response?.data?.code || '';
        debug = response?.data?.debug;
        traceId = (response?.data?.debug as Record<string, string>)?.traceId;
    } else if (isCustomError(error)) {
        const debugFull = error.debug as CustomErrorDebugFullArgs;
        status = debugFull?.status ?? null;
        requestId = debugFull?.requestId || DL.REQUEST_ID;
        message = error.message || '';
        details = (error.details || {}) as Record<string, string>;
        code = (debugFull?.code as string) || '';
        debug = debugFull;
        traceId = debugFull?.traceId;
    } else {
        message = error.message || '';
        stack = error.stack;
    }

    return {
        status,
        code,
        requestId,
        message,
        details,
        debug,
        traceId,
        stack,
        _parsedError: true as const,
    };
}

function isFetchBaseQueryError(error: RtkQueryError): error is FetchBaseQueryError {
    return (
        isObject(error) &&
        'status' in error &&
        (typeof error.status === 'string' || 'data' in error)
    );
}

export function parseRtkQueryError(apiError: RtkQueryError): ParsedError {
    const error = isObject(apiError) ? apiError : ({} as RtkQueryError);
    let status: number | null = null;
    let message = '';
    let code = '';
    let stack: string | undefined;

    if (isFetchBaseQueryError(error)) {
        if (typeof error.status === 'number') {
            status = error.status;
        }
    } else if (error) {
        code = error.code || '';
        message = error.message || '';
        stack = error.stack;
    }

    return {
        status,
        code,
        message,
        stack,
        details: {},
        traceId: undefined,
        requestId: DL.REQUEST_ID,
        debug: undefined,
        _parsedError: true,
    };
}
