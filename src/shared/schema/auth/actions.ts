import {createAction} from '../gateway-utils';
import {defaultParamsSerializer} from '../utils';

import type {SuccessResponse} from './types/common';
import type {
    AddUsersRolesArgs,
    CreateUserArgs,
    CreateUserResponse,
    DeleteUserArgs,
    GetUserProfileArgs,
    GetUserProfileResponse,
    GetUsersListArgs,
    GetUsersListResponse,
    RemoveUsersRolesArgs,
    UpdateMyUserPasswordArgs,
    UpdateMyUserProfileArgs,
    UpdateUserPasswordArgs,
    UpdateUserProfileArgs,
    UpdateUsersRolesArgs,
} from './types/users';

const PATH_PREFIX = '/v1';

export const actions = {
    addUsersRoles: createAction<SuccessResponse, AddUsersRolesArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/management/users/roles/add`,
        params: ({deltas}, headers) => ({body: {deltas}, headers}),
    }),
    updateUsersRoles: createAction<SuccessResponse, UpdateUsersRolesArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/management/users/roles/update`,
        params: ({deltas}, headers) => ({body: {deltas}, headers}),
    }),
    removeUsersRoles: createAction<SuccessResponse, RemoveUsersRolesArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/management/users/roles/remove`,
        params: ({deltas}, headers) => ({body: {deltas}, headers}),
    }),
    createUser: createAction<CreateUserResponse, CreateUserArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/management/users/create`,
        params: ({login, password, email, firstName, lastName, roles}, headers) => ({
            body: {login, password, email, firstName, lastName, roles},
            headers,
        }),
    }),
    deleteUser: createAction<SuccessResponse, DeleteUserArgs>({
        method: 'DELETE',
        path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}`,
        params: (_args, headers) => ({headers}),
    }),
    getUserProfile: createAction<GetUserProfileResponse, GetUserProfileArgs>({
        method: 'GET',
        path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}/profile`,
        params: (_args, headers) => ({headers}),
    }),
    updateUserProfile: createAction<SuccessResponse, UpdateUserProfileArgs>({
        method: 'POST',
        path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}/profile`,
        params: ({email, firstName, lastName}, headers) => ({
            body: {email, firstName, lastName},
            headers,
        }),
    }),
    updateUserPassword: createAction<SuccessResponse, UpdateUserPasswordArgs>({
        method: 'POST',
        path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}/password`,
        params: ({newPassword}, headers) => ({body: {newPassword}, headers}),
    }),

    getMyUserProfile: createAction<GetUserProfileResponse, undefined>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/users/me/profile`,
        params: (_args, headers) => ({headers}),
    }),
    updateMyUserProfile: createAction<SuccessResponse, UpdateMyUserProfileArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/users/me/profile`,
        params: ({email, firstName, lastName}, headers) => ({
            body: {email, firstName, lastName},
            headers,
        }),
    }),
    updateMyUserPassword: createAction<SuccessResponse, UpdateMyUserPasswordArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/users/me/password`,
        params: ({oldPassword, newPassword}, headers) => ({
            body: {oldPassword, newPassword},
            headers,
        }),
    }),
    getUsersList: createAction<GetUsersListResponse, GetUsersListArgs>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/users/list`,
        params: ({page, pageSize, filterString, roles}, headers) => ({
            query: {page, pageSize, filterString, roles},
            headers,
        }),
        paramsSerializer: defaultParamsSerializer,
    }),
};
