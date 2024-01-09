import React from 'react';

import _ from 'lodash';
import {EntryScope} from 'shared';
import Utils from 'utils';

import {GetEntryResponse} from '../../../../../../shared/schema';
import {WorkbookEntry} from '../../../types';

const CHUNK_SIZE = 100;

type EntryChunkItem = {
    type: 'entry';
    item: WorkbookEntry;
    key: string;
};

type EmptyChunkItem = {
    type: 'empty';
    key: 'empty';
};

export type ChunkItem = EntryChunkItem | EmptyChunkItem;

export const useChunkedEntries = (entries: GetEntryResponse[]): ChunkItem[][] => {
    const chunks = React.useMemo(() => {
        const allowedScopes = new Set([
            EntryScope.Dash,
            EntryScope.Widget,
            EntryScope.Dataset,
            EntryScope.Connection,
        ]);

        const workbookEntries = entries
            .filter((item) => allowedScopes.has(item.scope as EntryScope))
            .map((item) => {
                const workbookEntry: WorkbookEntry = {
                    name: Utils.getEntryNameFromKey(item.key),
                    ...item,
                };
                return workbookEntry;
            });

        let items: ChunkItem[] = [];

        if (workbookEntries.length === 0) {
            items.push({
                type: 'empty',
                key: 'empty',
            });
        } else {
            items = workbookEntries.map<EntryChunkItem>((item) => ({
                type: 'entry',
                item,
                key: item.entryId,
            }));
        }

        return _.chunk(items, CHUNK_SIZE);
    }, [entries]);

    return chunks;
};
