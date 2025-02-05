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

export interface GetUserProfileResponse {
    profile: {
        userId: string;
        login: string | null;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        roles: `${UserRole}`[];
    };
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

export interface GetUsersListResponse {
    nextPageToken?: string;
    users: {
        userId: string;
        login: string | null;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        roles: `${UserRole}`[];
        providerId: string | null;
    }[];
}
