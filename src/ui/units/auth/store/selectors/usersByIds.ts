import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui/index';

import {getUserDisplayName} from '../../utils/userProfile';
import type {PreparedUserById, UserByIdMap} from '../typings/usersByIds';

const selectUsers = (state: DatalensGlobalState) => state.auth.usersByIds.users;

export const selectUsersByIds = createSelector(selectUsers, (users) =>
    Object.keys(users).reduce<UserByIdMap>((usersByIds, userId) => {
        const user = users[userId];
        let preparedUserById: PreparedUserById;
        if (user.loading) {
            preparedUserById = {
                status: 'loading',
            };
        } else if (user.error === null && user.data) {
            const data = user.data;
            let login: string;
            if (data.source === 'system') {
                login = data.subject.login;
            } else {
                login = data.subject.login || getUserDisplayName(data.subject, true);
            }

            preparedUserById = {
                status: 'resolved',
                id: userId,
                login,
                data,
            };
        } else {
            preparedUserById = {
                status: 'error',
                error: user.error || new Error('Unknown user'),
            };
        }
        usersByIds[userId] = preparedUserById;
        return usersByIds;
    }, {}),
);
