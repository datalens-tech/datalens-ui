import type {SerializedError} from '@reduxjs/toolkit';
import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import type {AxiosError} from 'axios';
import isObject from 'lodash/isObject';
import type {ManualError} from 'utils/errors/manual';

import type {ChartKitCustomError} from '../libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import type {OperationError, SdkError} from '../libs/schematic-sdk';

export type DataLensApiError =
    | ManualError
    | OperationError
    | SdkError
    | AxiosError<{message?: string; details?: object; code?: string; debug?: unknown}>
    | Error
    | ChartKitCustomError;

export type RtkQueryError = FetchBaseQueryError | SerializedError | undefined;

export interface ParsedError {
    status: number | null;
    code: string;
    requestId: string;
    message: string;
    details: Record<string, string>;
    debug: unknown;
    traceId?: string | undefined;
    stack?: string | undefined;

    _parsedError: true;
}

export function isParsedError(error: unknown): error is ParsedError {
    return isObject(error) && '_parsedError' in error && error._parsedError === true;
}
