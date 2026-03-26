import type {SharedWorkbookEntry, WorkbookEntryBase} from 'shared/schema';

export type BaseListItem<E> = {
    qa: string;
    entry: E & {name: string};
    inactive: boolean;
};

export type Item = BaseListItem<WorkbookEntryBase>;

export type SharedItem = BaseListItem<SharedWorkbookEntry>;
