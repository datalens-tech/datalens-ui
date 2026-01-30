import {SYSTEM_USER} from 'shared/constants';

import type {UsersByIdsAction} from '../actions/usersByIds';
import {SET_QUEUE, SET_USERS} from '../constants/usersByIds';
import type {UsersByIdsState} from '../typings/usersByIds';

const initialState: UsersByIdsState = {
    queue: [],
    users: {
        [SYSTEM_USER.UID]: {
            loading: false,
            error: null,
            data: {
                source: 'system',
                subject: {
                    uid: SYSTEM_USER.UID,
                    login: SYSTEM_USER.LOGIN,
                },
            },
        },
    },
};

export function usersByIdReducer(state = initialState, action: UsersByIdsAction): UsersByIdsState {
    switch (action.type) {
        case SET_QUEUE:
            return {
                ...state,
                queue: [...action.payload.userIds],
            };
        case SET_USERS:
            return {
                ...state,
                users: {
                    ...state.users,
                    ...action.payload.users,
                },
            };
        default:
            return state;
    }
}
