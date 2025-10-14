import React from 'react';

import type {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import Utils from 'utils';

import type {ChunkItem, EntryChunkItem, WorkbookEntry} from '../../types';

export const useChunkedEntries = ({
    entries,
    availableScopes,
}: {
    entries: GetEntryResponse[];
    availableScopes: EntryScope[];
}): ChunkItem[][] => {
    const chunks = React.useMemo(() => {
        const allowedScopes = new Set(availableScopes);

        const workbookEntries = entries
            .filter((item) => allowedScopes.has(item.scope as EntryScope))
            .map((item) => {
                const workbookEntry: WorkbookEntry = {
                    name: Utils.getEntryNameFromKey(item.key),
                    ...item,
                };
                return workbookEntry;
            });

        if (workbookEntries.length === 0) {
            return [];
        } else {
            const chunkArrays = availableScopes.map(() => [] as Array<EntryChunkItem>);

            workbookEntries.forEach((chunkItem) => {
                const item = {
                    type: 'entry',
                    item: chunkItem,
                    key: chunkItem.entryId,
                } as EntryChunkItem;

                const chunkIndex = availableScopes.findIndex((scope) => scope === chunkItem.scope);

                if (chunkIndex > -1) {
                    chunkArrays[chunkIndex].push(item);
                }
            });

            return chunkArrays;
        }
    }, [availableScopes, entries]);

    return chunks;
};
