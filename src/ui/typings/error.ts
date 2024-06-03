import type {AxiosError} from 'axios';
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
