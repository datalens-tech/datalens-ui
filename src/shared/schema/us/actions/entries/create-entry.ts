import {EntryUpdateMode} from '../../../..';
import {createAction} from '../../../gateway-utils';
import type {CreateEntryArgs, CreateEntryResponse} from '../../types';

export const _createEntry = createAction<CreateEntryResponse, CreateEntryArgs>({
    method: 'POST',
    path: () => '/v1/entries',
    params: (
        {
            scope,
            type,
            key,
            data,
            meta = {},
            name,
            workbookId,
            mode = EntryUpdateMode.Publish,
            links,
            annotation,
        },
        headers,
    ) => {
        return {
            body: {
                scope,
                type,
                key,
                meta,
                data,
                name,
                workbookId,
                mode,
                links,
                annotation,
            },
            headers,
        };
    },
});
