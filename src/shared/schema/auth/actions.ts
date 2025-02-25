import {isTrueArg} from '../../modules';
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
    GetUsersByIdsArgs,
    GetUsersByIdsResponse,
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

const disableUserEdit = isTrueArg(process.env.DISABLE_USER_EDIT);

export const actions = {
    createUser: createAction<CreateUserResponse, CreateUserArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/management/users/create`,
        params: ({login, password, email, firstName, lastName, roles}, headers) => ({
            body: {login, password, email, firstName, lastName, roles},
            headers,
        }),
    }),
    getUserProfile: createAction<GetUserProfileResponse, GetUserProfileArgs>({
        method: 'GET',
        path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}/profile`,
        params: (_args, headers) => ({headers}),
    }),

    ...(disableUserEdit
        ? {}
        : {
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
              deleteUser: createAction<SuccessResponse, DeleteUserArgs>({
                  method: 'DELETE',
                  path: ({userId}) => `${PATH_PREFIX}/management/users/${userId}`,
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
          }),

    getMyUserProfile: createAction<GetUserProfileResponse, undefined>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/users/me/profile`,
        params: (_args, headers) => ({headers}),
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
    getUsersByIds: createAction<GetUsersByIdsResponse, GetUsersByIdsArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/users/get-by-ids`,
        params: ({subjectIds}, headers) => ({
            body: {subjectIds},
            headers,
        }),
    }),
};
