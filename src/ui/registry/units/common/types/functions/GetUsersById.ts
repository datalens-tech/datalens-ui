import type {ListSuggestUser} from 'ui/components/UsersSuggest/types';

export type GetUsersById = (
    userIds: string[],
    organizationId?: string,
) => Promise<Record<string, ListSuggestUser>>;
