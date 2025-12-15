import {DL_COMPONENT_HEADER, DlComponentHeader, WORKBOOK_ID_HEADER} from '../../../..';
import {createAction} from '../../../gateway-utils';
import {filterUrlFragment} from '../../../utils';
import type {GetEntryArgs, GetEntryResponse} from '../../types';

export const getEntry = createAction<GetEntryResponse, GetEntryArgs>({
    method: 'GET',
    path: ({entryId}) => `/v1/entries/${filterUrlFragment(entryId)}`,
    params: (
        {entryId: _entryId, workbookId, includeDlComponentUiData, includeFavorite = true, ...query},
        headers,
    ) => ({
        query: {
            ...query,
            includeFavorite,
        },
        headers: {
            ...headers,
            ...(includeDlComponentUiData ? {[DL_COMPONENT_HEADER]: DlComponentHeader.UI} : {}),
            ...(workbookId ? {[WORKBOOK_ID_HEADER]: workbookId} : {}),
        },
    }),
});
