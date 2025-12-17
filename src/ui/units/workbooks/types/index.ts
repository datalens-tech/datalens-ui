import type {SharedScope} from 'shared';

import type {GetEntryResponse} from '../../../../shared/schema';
import type {
    OrderDirection,
    OrderWorkbookEntriesField,
} from '../../../../shared/schema/us/types/sort';

export type WorkbookEntriesFilters = {
    orderField: OrderWorkbookEntriesField;
    orderDirection: OrderDirection;
    filterString?: string;
};

export type WorkbookEntry = GetEntryResponse & {name: string};
export type WorkbookSharedEntry = WorkbookEntry & {isDelegated?: boolean; scope: SharedScope};

export type EntryChunkItem<T extends WorkbookEntry> = {
    type: 'entry';
    item: T;
    key: string;
};

export type EmptyChunkItem = {
    type: 'empty';
    key: 'empty';
};

export type ChunkItem<T extends WorkbookEntry> = EntryChunkItem<T> | EmptyChunkItem;
