import type {SharedScope, WorkbookEntry as WorkbookEntity} from 'shared';
import type {RestrictedSharedWorkbookEntry, SharedWorkbookEntry} from 'shared/schema';

import type {
    OrderDirection,
    OrderWorkbookEntriesField,
} from '../../../../shared/schema/us/types/sort';

export type WorkbookEntriesFilters = {
    orderField: OrderWorkbookEntriesField;
    orderDirection: OrderDirection;
    filterString?: string;
};

export type WorkbookUnionEntry = WorkbookEntity & {name: string};
export type WorkbookEntry = Exclude<
    WorkbookUnionEntry,
    SharedWorkbookEntry | RestrictedSharedWorkbookEntry
>;
export type WorkbookSharedEntry = Exclude<WorkbookUnionEntry, RestrictedSharedWorkbookEntry> & {
    isDelegated?: boolean;
    scope: SharedScope;
};

export type EntryChunkItem<T extends WorkbookUnionEntry> = {
    type: 'entry';
    item: T;
    key: string;
};

export type EmptyChunkItem = {
    type: 'empty';
    key: 'empty';
};

export type ChunkItem<T extends WorkbookUnionEntry> = EntryChunkItem<T> | EmptyChunkItem;
