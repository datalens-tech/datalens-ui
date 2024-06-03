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

export type EntryChunkItem = {
    type: 'entry';
    item: WorkbookEntry;
    key: string;
};

export type EmptyChunkItem = {
    type: 'empty';
    key: 'empty';
};

export type ChunkItem = EntryChunkItem | EmptyChunkItem;
