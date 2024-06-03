import type {ResponseError} from '@gravity-ui/gateway';

import type {
    ConnectionErrorResponse,
    GetDistinctsApiV2Response,
    GetDistinctsApiV2TransformedResponse,
    GetDistinctsResponse,
    ValidateDatasetErrorResponse,
    ValidateDatasetFormulaErrorResponse,
} from '../types';

const transformResponseError = <T extends {code: string; message: string}>(
    response: ResponseError,
) => {
    const data = (response.data || {}) as T;
    const {code, message} = data;

    return {
        code,
        message,
        status: response.status,
        details: {data},
    };
};

export const transformValidateDatasetResponseError = (response: ResponseError) =>
    transformResponseError<ValidateDatasetErrorResponse>(response);

export const transformValidateDatasetFormulaResponseError = (response: ResponseError) =>
    transformResponseError<ValidateDatasetFormulaErrorResponse>(response);

export const transformConnectionResponseError = (response: ResponseError) =>
    transformResponseError<ConnectionErrorResponse>(response);

export const transformApiV2DistinctsResponse = (
    response: GetDistinctsApiV2Response,
): GetDistinctsApiV2TransformedResponse => {
    const {result_data} = response;

    const rows = result_data[0].rows;

    const responseData = rows.reduce(
        (data, row) => {
            return [...data, row.data];
        },
        [] as GetDistinctsResponse['result']['data']['Data'],
    );

    return {
        result: {
            data: {
                Data: responseData,
            },
        },
    };
};
