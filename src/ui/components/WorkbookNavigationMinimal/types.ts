import type {GetEntryResponse, GetSharedEntryResponse} from 'shared/schema';

export type BaseListItem<E> = {
    qa: string;
    entry: E & {name: string};
    inactive: boolean;
};

export type Item = BaseListItem<GetEntryResponse>;

export type SharedItem = BaseListItem<GetSharedEntryResponse>;
