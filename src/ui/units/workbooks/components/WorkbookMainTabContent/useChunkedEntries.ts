import React from 'react';

import _ from 'lodash';
import {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import Utils from 'utils';

import type {ChunkItem, EntryChunkItem, WorkbookEntry} from '../../types';

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

        if (workbookEntries.length === 0) {
            return [];
        } else {
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
        }
    }, [entries]);

    return chunks;
};
