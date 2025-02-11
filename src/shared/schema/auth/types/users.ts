import type {UserRole} from '../../../components/auth/constants/role';

export interface AddUsersRolesArgs {
    deltas: {
        role: `${UserRole}`;
        subjectId: string;
    }[];
}

export interface RemoveUsersRolesArgs extends AddUsersRolesArgs {}

export interface UpdateUsersRolesArgs {
    deltas: {
        oldRole: `${UserRole}`;
        newRole: `${UserRole}`;
        subjectId: string;
    }[];
}

export interface CreateUserArgs {
    login: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: `${UserRole}`[];
}

export interface CreateUserResponse {
    userId: string;
}

export interface DeleteUserArgs {
    userId: string;
}

export interface GetUserProfileArgs {
    userId: string;
}

interface UserProfile {
    userId: string;
    login: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    roles: `${UserRole}`[];
}

export interface GetUserProfileResponse {
    profile: UserProfile;
}

interface UpdateUserProfile {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface UpdateUserProfileArgs extends UpdateUserProfile {
    userId: string;
}

export interface UpdateMyUserProfileArgs extends UpdateUserProfile {}

export interface UpdateUserPasswordArgs {
    userId: string;
    newPassword: string;
}

export interface UpdateMyUserPasswordArgs {
    oldPassword: string;
    newPassword: string;
}

export interface GetUsersListArgs {
    page?: number;
    pageSize?: number;
    filterString?: string;
    roles?: `${UserRole}`[];
}

interface GetUserList extends UserProfile {
    providerId: string | null;
}

export interface GetUsersListResponse {
    nextPageToken?: string;
    users: GetUserList[];
}
