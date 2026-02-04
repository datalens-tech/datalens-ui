import React from 'react';

import _ from 'lodash';
import type {EntryScope, WorkbookEntry} from 'shared';
import Utils, {getIsRestrictedSharedEntry} from 'utils';

import {CHUNK_SIZE} from '../../constants';
import type {ChunkItem, EntryChunkItem, WorkbookUnionEntry} from '../../types';

export const useChunkedEntries = <T extends WorkbookUnionEntry>({
    entries,
    availableScopes,
}: {
    entries: WorkbookEntry[];
    availableScopes: EntryScope[];
}): ChunkItem<T>[][] => {
    const chunks = React.useMemo(() => {
        const allowedScopes = new Set(availableScopes);

        const workbookEntries = entries
            .filter((item) => allowedScopes.has(item.scope as EntryScope))
            .map((item) => {
                const isRestricted = getIsRestrictedSharedEntry(item);
                const workbookEntry = {
                    name: isRestricted ? item.entryId : Utils.getEntryNameFromKey(item.key),
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
