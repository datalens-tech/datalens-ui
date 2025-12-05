import React from 'react';

import _ from 'lodash';
import type {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import Utils from 'utils';

import {CHUNK_SIZE} from '../../constants';
import type {ChunkItem, EntryChunkItem, WorkbookEntry} from '../../types';

export const useChunkedEntries = <T extends WorkbookEntry>({
    entries,
    availableScopes,
}: {
    entries: GetEntryResponse[];
    availableScopes: EntryScope[];
}): ChunkItem<T>[][] => {
    const chunks = React.useMemo(() => {
        const allowedScopes = new Set(availableScopes);

        const workbookEntries = entries
            .filter((item) => allowedScopes.has(item.scope as EntryScope))
            .map((item) => {
                const workbookEntry = {
                    name: Utils.getEntryNameFromKey(item.key),
                    ...item,
                } as T;
                return workbookEntry;
            });

        const items: ChunkItem<T>[] = [];

        if (workbookEntries.length === 0) {
            items.push({
                type: 'empty',
                key: 'empty',
            });
        } else {
            items.push(
                ...workbookEntries.map<EntryChunkItem<T>>((item) => ({
                    type: 'entry',
                    item,
                    key: item.entryId,
                })),
            );
        }

        return _.chunk(items, CHUNK_SIZE);
    }, [availableScopes, entries]);

    return chunks;
};
