import {createAction} from '../../gateway-utils';
import type {GetDatalensOperationArgs, GetDatalensOperationResponse} from '../types';

const OPERATIONS_PATH_PREFIX = '/v1/operation';

export const operationsActions = {
    getOperation: createAction<GetDatalensOperationResponse, GetDatalensOperationArgs>({
        method: 'GET',
        path: ({operationId}) => `${OPERATIONS_PATH_PREFIX}/${operationId}`,
        params: (_, headers) => ({
            headers,
        }),
    }),
};
