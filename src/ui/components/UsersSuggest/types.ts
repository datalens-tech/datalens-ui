export interface ListSuggestUser {
    id: string;
    login?: string;
    name: string;
    email?: string;
    meta?: string;
    avatarUrl?: string;
}

export type GetUsersSuggestItems = (
    search: string,
    onSuccess?: (items: ListSuggestUser[]) => void,
    onRequestEnd?: () => void,
) => Promise<ListSuggestUser[]>;
