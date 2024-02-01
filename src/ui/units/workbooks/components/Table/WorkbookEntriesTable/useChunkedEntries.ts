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

export const useChunkedEntries = (
    entries: GetEntryResponse[],
    separateByScope?: boolean,
): ChunkItem[][] => {
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
            if (separateByScope) return [];

            items.push({
                type: 'empty',
                key: 'empty',
            });
        } else if (separateByScope) {
            const dashChunk: ChunkItem[] = [];
            const connChunk: ChunkItem[] = [];
            const datasetChunk: ChunkItem[] = [];
            const widgetChunk: ChunkItem[] = [];

            workbookEntries.forEach((chunkItem) => {
                const item = {
                    type: 'entry',
                    item: chunkItem,
                    key: chunkItem.entryId,
                } as EntryChunkItem;

                switch (chunkItem.scope) {
                    case EntryScope.Dash:
                        dashChunk.push(item);
                        break;
                    case EntryScope.Connection:
                        connChunk.push(item);
                        break;
                    case EntryScope.Dataset:
                        datasetChunk.push(item);
                        break;
                    case EntryScope.Widget:
                        widgetChunk.push(item);
                        break;
                }
            });

            return [dashChunk, connChunk, datasetChunk, widgetChunk];
        } else {
            items = workbookEntries.map<EntryChunkItem>((item) => ({
                type: 'entry',
                item,
                key: item.entryId,
            }));
        }

        return _.chunk(items, CHUNK_SIZE);
    }, [entries, separateByScope]);

    return chunks;
};
