import type {CreateUserResponse, ListUser} from 'shared/schema/auth/types/users';

export type ServiceSettingsState = {
    getUsersList: {
        isLoading: boolean;
        users: ListUser[];
        nextPageToken: string | null;
        error: Error | null;
    };
    createUser: {
        isLoading: boolean;
        data: CreateUserResponse | null;
        error: Error | null;
    };
};
