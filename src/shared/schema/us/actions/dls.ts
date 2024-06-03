import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import type {
    BatchPermissionsArgs,
    BatchPermissionsResponse,
    CheckBulkPermissionArgs,
    CheckBulkPermissionResponse,
    DlsSuggestArgs,
    DlsSuggestResponse,
    GetPermissionsArgs,
    GetPermissionsResponse,
    ModifyPermissionsArgs,
    ModifyPermissionsResponse,
} from '../types';

const PATH_PREFIX = '/dls';

export const dlsActions = {
    getPermissions: createAction<GetPermissionsResponse, GetPermissionsArgs>({
        method: 'GET',
        path: ({entryId}) => `${PATH_PREFIX}/nodes/all/${filterUrlFragment(entryId)}/permissions`,
        params: (_, headers) => ({headers}),
    }),
    dlsSuggest: createAction<DlsSuggestResponse, DlsSuggestArgs>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/suggest/subjects`,
        params: ({searchText}, headers) => ({
            query: {limit: 100, search_text: searchText},
            headers,
        }),
    }),
    modifyPermissions: createAction<ModifyPermissionsResponse, ModifyPermissionsArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/nodes/all/${filterUrlFragment(entryId)}/permissions`,
        params: ({body}, headers) => ({body, headers}),
    }),
    batchPermissions: createAction<BatchPermissionsResponse, BatchPermissionsArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/batchPermissions`,
        params: (body, headers) => ({body, headers}),
    }),
    checkBulkPermission: createAction<CheckBulkPermissionResponse, CheckBulkPermissionArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/checkBulkPermission`,
        params: (body, headers) => ({body, headers}),
    }),
};
