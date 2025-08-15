import {WORKBOOK_ID_HEADER} from '../../../constants';
import {createAction} from '../../gateway-utils';
import type {GetEntryMetaArgs, GetEntryMetaResponse, GetEntryResponse} from '../../us/types';
import {filterUrlFragment} from '../../utils';
import type {PrivateGetEntryArgs, ProxyCreateEntryArgs} from '../types';
const PRIVATE_PATH_PREFIX = '/private';

export const entriesActions = {
    _getEntryMeta: createAction<GetEntryMetaResponse, GetEntryMetaArgs>({
        method: 'GET',
        path: ({entryId}) => `${PRIVATE_PATH_PREFIX}/entries/${entryId}/meta`,
        params: (_, headers) => ({
            headers,
        }),
    }),
    _proxyGetEntry: createAction<GetEntryResponse, PrivateGetEntryArgs>({
        method: 'GET',
        path: ({entryId}) => `${PRIVATE_PATH_PREFIX}/entries/${filterUrlFragment(entryId)}`,
        params: ({entryId: _entryId, workbookId, ...query}, headers) => {
            return {
                query,
                headers: {
                    ...headers,
                    ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
                },
            };
        },
    }),
    _proxyCreateEntry: createAction<GetEntryResponse, ProxyCreateEntryArgs>({
        method: 'POST',
        path: () => `${PRIVATE_PATH_PREFIX}/entries/`,
        params: (
            {
                workbookId,
                data,
                name,
                type,
                scope,
                mode,
                links,
                key,
                recursion,
                includePermissionsInfo,
            },
            headers,
        ) => ({
            headers: {
                ...headers,
                ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
            },
            body: {
                workbookId,
                data,
                name,
                type,
                scope,
                mode,
                links,
                recursion,
                includePermissionsInfo,
                ...(key ? {key} : {}),
            },
        }),
    }),
};
