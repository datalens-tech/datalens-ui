import {EntryUpdateMode} from '../../../..';
import {createAction} from '../../../gateway-utils';
import {filterUrlFragment} from '../../../utils';
import type {UpdateEntryArgs, UpdateEntryResponse} from '../../types';

export const _updateEntry = createAction<UpdateEntryResponse, UpdateEntryArgs>({
    method: 'POST',
    path: ({entryId}) => `/v1/entries/${filterUrlFragment(entryId)}`,
    params: (
        {data, meta = {}, revId, mode = EntryUpdateMode.Publish, links, annotation},
        headers,
    ) => {
        return {
            body: {
                mode,
                meta,
                data,
                revId,
                links,
                annotation,
            },
            headers,
        };
    },
});
