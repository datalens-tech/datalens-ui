import type {ListUser} from 'shared/schema/auth/types/users';

export type ServiceSettingsState = {
    getUsersList: {
        isLoading: boolean;
        users: ListUser[];
        nextPageToken: string | null;
        error: Error | null;
    };
};
