import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import type {
    CreateDashStateArgs,
    CreateDashStateResponse,
    GetDashStateArgs,
    GetDashStateResponse,
} from '../types';

const PATH_PREFIX = '/v1';

export const stateActions = {
    getDashState: createAction<GetDashStateResponse, GetDashStateArgs>({
        method: 'GET',
        path: ({entryId, hash}) =>
            `${PATH_PREFIX}/states/${filterUrlFragment(entryId)}/${filterUrlFragment(hash)}`,
        params: (_, headers) => ({headers}),
    }),
    createDashState: createAction<CreateDashStateResponse, CreateDashStateArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/states/${filterUrlFragment(entryId)}`,
        params: ({data}, headers) => ({body: {data}, headers}),
    }),
};
