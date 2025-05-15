export interface ListSuggestUser {
    id: string;
    name: string;
    avatarUrl?: string;
}

export type GetUsersSuggestItems = (
    search: string,
    onSuccess?: (items: ListSuggestUser[]) => void,
    onRequestEnd?: () => void,
) => Promise<ListSuggestUser[]>;
