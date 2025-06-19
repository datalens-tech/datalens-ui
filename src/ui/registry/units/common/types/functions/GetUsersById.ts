import type {ListSuggestUser} from 'ui/components/UsersSuggest/types';

export type GetUsersById = (userIds: string[]) => Promise<Record<string, ListSuggestUser>>;
