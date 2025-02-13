import type {GetUsersListResponse, ListUser} from 'shared/schema/auth/types/users';

export type ServiceSettingsState = {
    getUsersList: {
        isLoading: boolean;
        data: GetUsersListResponse | null;
        error: Error | null;
    };
    displayedUsers: ListUser[];
};
