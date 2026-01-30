import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import type {
    CreateLockArgs,
    CreateLockResponse,
    DeleteLockArgs,
    DeleteLockResponse,
    ExtendLockArgs,
    ExtendLockResponse,
} from '../types';

const PATH_PREFIX = '/v1';

export const locksActions = {
    createLock: createAction<CreateLockResponse, CreateLockArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/locks/${filterUrlFragment(entryId)}`,
        params: ({data: body}, headers) => ({body, headers}),
    }),
    extendLock: createAction<ExtendLockResponse, ExtendLockArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/locks/${filterUrlFragment(entryId)}/extend`,
        params: ({data: body}, headers) => ({body, headers}),
    }),
    deleteLock: createAction<DeleteLockResponse, DeleteLockArgs>({
        method: 'DELETE',
        path: ({entryId}) => `${PATH_PREFIX}/locks/${filterUrlFragment(entryId)}`,
        params: ({params: query}, headers) => {
            if (typeof query !== 'object') {
                return {headers};
            }

            return {query, headers};
        },
    }),
};
