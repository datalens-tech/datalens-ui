import chunk from 'lodash/chunk';
import defer from 'lodash/defer';
import groupBy from 'lodash/groupBy';
import type {UserSubject} from 'shared/schema/auth/types/users';
import type {DatalensGlobalState} from 'ui/index';
import logger from 'ui/libs/logger';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {ResolveUsersByIds} from 'ui/registry/units/common/types/functions/resolveUsersByIds';
import type {AppDispatch} from 'ui/store';

import {SET_QUEUE, SET_USERS} from '../constants/usersByIds';
import type {UsersByIdsState} from '../typings/usersByIds';

type SetUsersAction = {
    type: typeof SET_USERS;
    payload: {
        users: UsersByIdsState['users'];
    };
};

const setUsers = (payload: SetUsersAction['payload']): SetUsersAction => ({
    type: SET_USERS,
    payload,
});
export function resolveUsersByIds<T = DatalensGlobalState>(ids: string[]): ResolveUsersByIds<T> {
    return async (dispatch: AppDispatch<UsersByIdsAction, T>, getState: () => T) => {
        if (ids.length === 0) {
            return;
        }

        const state = getState() as DatalensGlobalState;

        const stateUsers = state.auth.usersByIds.users;

        const userIds = Array.from(new Set(ids)).filter((id) => {
            if (id in stateUsers) {
                const user = stateUsers[id];
                return !(user.data || user.loading);
            }
            return true;
        });

        if (userIds.length === 0) {
            return;
        }

        const loadingUsers = userIds.reduce<UsersByIdsState['users']>((users, id: string) => {
            users[id] = {
                data: null,
                loading: true,
                error: null,
            };
            return users;
        }, {});

        dispatch(setUsers({users: loadingUsers}));

        try {
            const CHUNK_SIZE = 100;
            const chunks = chunk(userIds, CHUNK_SIZE);

            const subjectDetails: UserSubject[] = [];
            for (const chunk of chunks) {
                const claims = await getSdk().sdk.auth.getUsersByIds({subjectIds: chunk});
                const details = claims.users || [];
                subjectDetails.push(...details);
            }
            const groupById = groupBy(subjectDetails, (subject) => subject.userId);
            const resolvedUsers = userIds.reduce<UsersByIdsState['users']>((users, id) => {
                const subject = groupById[id][0];
                users[id] = {
                    data: subject
                        ? {
                              source: 'user',
                              subject,
                          }
                        : null,
                    loading: false,
                    error: subject ? null : new Error('Unknown user'),
                };
                return users;
            }, {});

            dispatch(setUsers({users: resolvedUsers}));
        } catch (error) {
            logger.logError('resolveUsersByIds failed', error);

            const errorUsers = userIds.reduce<UsersByIdsState['users']>((users, id) => {
                users[id] = {
                    data: null,
                    loading: false,
                    error,
                };
                return users;
            }, {});

            dispatch(setUsers({users: errorUsers}));
        }
    };
}

type SetQueueAction = {
    type: typeof SET_QUEUE;
    payload: {
        userIds: string[];
    };
};

const setQueue = (payload: SetQueueAction['payload']): SetQueueAction => ({
    type: SET_QUEUE,
    payload,
});

export function resolveUsers<T = DatalensGlobalState>(ids: string[]) {
    return async (dispatch: AppDispatch<any, T>, getState: () => T) => {
        const state = getState() as DatalensGlobalState;

        const currentQueueState = state.auth.usersByIds.queue;
        const newQueueState = new Set([...currentQueueState, ...ids]);
        dispatch(setQueue({userIds: Array.from(newQueueState)}));

        defer(() => {
            const userIds = (getState() as DatalensGlobalState).auth.usersByIds.queue;
            dispatch(resolveUsersByIds(userIds));
            dispatch(setQueue({userIds: []}));
        });
    };
}

export type UsersByIdsAction = SetUsersAction | SetQueueAction;
