import {createAction} from '../../gateway-utils';
import {transformConnectionResponseError} from '../helpers';
import type {
    GetOAuthTokenArgs,
    GetOAuthTokenResponse,
    GetOAuthUriArgs,
    GetOAuthUriResponse,
} from '../types';

const PATH_PREFIX = '/oauth';

export const actions = {
    getOAuthUri: createAction<GetOAuthUriResponse, GetOAuthUriArgs>({
        method: 'GET',
        path: ({scope}) => `${PATH_PREFIX}/uri/${scope}`,
        params: ({conn_type}, headers) => ({headers, query: {conn_type}}),
        transformResponseError: transformConnectionResponseError,
    }),
    getOAuthToken: createAction<GetOAuthTokenResponse, GetOAuthTokenArgs>({
        method: 'POST',
        path: ({scope}) => `${PATH_PREFIX}/token/${scope}`,
        params: ({code, conn_type}, headers) => ({headers, body: {code, conn_type}}),
        transformResponseError: transformConnectionResponseError,
    }),
};
