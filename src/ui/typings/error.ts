import {AxiosError} from 'axios';
import {ManualError} from 'utils/errors/manual';

import type {ChartKitCustomError} from '../libs/DatalensChartkit/ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {OperationError, SdkError} from '../libs/schematic-sdk';

export type DataLensApiError =
    | ManualError
    | OperationError
    | SdkError
    | AxiosError<{message?: string; details?: object; code?: string; debug?: unknown}>
    | Error
    | ChartKitCustomError;
