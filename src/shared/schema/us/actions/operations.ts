import {createAction} from '../../gateway-utils';
import type {
    FetchDatalensOperationArgs,
    GetDatalensOperationArgs,
    GetDatalensOperationResponse,
} from '../types';

const OPERATIONS_PATH_PREFIX = '/v1/operation';

export const operationsActions = {
    // TODO: DLAPI-797 remove this action
    getOperation: createAction<GetDatalensOperationResponse, GetDatalensOperationArgs>({
        method: 'GET',
        path: ({operationId}) => `${OPERATIONS_PATH_PREFIX}/${operationId}`,
        params: (_, headers) => ({
            headers,
        }),
    }),
    fetchOperation: createAction<GetDatalensOperationResponse, FetchDatalensOperationArgs>({
        method: 'POST',
        path: ({operationId}) => `${OPERATIONS_PATH_PREFIX}/${operationId}`,
        params: ({meta}, headers) => ({
            body: {meta},
            headers,
        }),
    }),
};
